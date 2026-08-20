/**
 * firestoreSync.js
 * Local-first Dexie ↔ Firestore sync layer.
 *
 * Strategy:
 * - All WRITES go to Dexie first (instant, works offline).
 * - A background sync pushes new/updated records to Firestore when online.
 * - On startup, Firestore data is pulled down and merged into Dexie.
 * - Real-time Firestore listeners keep the local DB updated while online.
 */

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db as firestore } from './firebase';
import { db as dexie } from './database';

// Collections to sync
// Collections to sync
const COLLECTIONS = ['products', 'transactions', 'cashLogs', 'stockLogs', 'users', 'announcements', 'storeSettings'];

let unsubscribers = [];

/**
 * Push a single Dexie record to Firestore.
 * Uses the local Dexie id or key as the Firestore document id.
 */
export async function pushToFirestore(collectionName, record) {
  try {
    const docId = record.id !== undefined ? String(record.id) : String(record.key);
    const docRef = doc(firestore, collectionName, docId);
    await setDoc(docRef, { ...record, _syncedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn(`[Sync] Failed to push ${collectionName}/${record.id || record.key}:`, err.message);
  }
}

/**
 * Delete a Firestore document by collection + id/key.
 */
export async function deleteFromFirestore(collectionName, id) {
  try {
    await deleteDoc(doc(firestore, collectionName, String(id)));
  } catch (err) {
    console.warn(`[Sync] Failed to delete ${collectionName}/${id}:`, err.message);
  }
}

/**
 * Pull all Firestore records into Dexie on startup.
 * Only inserts records that don't already exist locally (by id/key).
 */
async function pullCollection(collectionName) {
  try {
    const snap = await getDocs(collection(firestore, collectionName));
    const table = dexie[collectionName];
    if (!table) return;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const lookupKey = data.id !== undefined ? data.id : data.key;

      // Skip records that were intentionally deleted locally (tombstone check)
      const tombstone = await dexie.deletedIds
        .where({ id: String(lookupKey), collection: collectionName })
        .first();
      if (tombstone) continue;

      const existing = await table.get(lookupKey);
      if (!existing) {
        await table.put(data);
      }
    }
    console.log(`[Sync] Pulled ${snap.docs.length} records from ${collectionName}`);
  } catch (err) {
    console.warn(`[Sync] Pull failed for ${collectionName}:`, err.message);
  }
}

/**
 * Push all local Dexie records to Firestore (initial full sync).
 */
async function pushAllLocal() {
  for (const col of COLLECTIONS) {
    try {
      const table = dexie[col];
      if (!table) continue;
      const records = await table.toArray();
      for (const record of records) {
        await pushToFirestore(col, record);
      }
      console.log(`[Sync] Pushed ${records.length} local records to ${col}`);
    } catch (err) {
      console.warn(`[Sync] Push failed for ${col}:`, err.message);
    }
  }
}

/**
 * Start real-time Firestore listeners. 
 * When Firestore changes, update local Dexie automatically.
 */
export function startRealtimeListeners() {
  stopRealtimeListeners(); // Clear any existing

  for (const col of COLLECTIONS) {
    const table = dexie[col];
    if (!table) continue;

    const q = query(collection(firestore, col));
    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        if (change.type === 'added' || change.type === 'modified') {
          await table.put(data);
        } else if (change.type === 'removed') {
          const deleteKey = data.id !== undefined ? data.id : data.key;
          await table.delete(deleteKey);
        }
      });
    }, (err) => {
      console.warn(`[Sync] Real-time listener error for ${col}:`, err.message);
    });

    unsubscribers.push(unsub);
  }

  console.log('[Sync] Real-time listeners started');
}

/**
 * Stop all active Firestore listeners.
 */
export function stopRealtimeListeners() {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
}

/**
 * Full initial sync: pull from Firestore + push local data + start listeners.
 * Called once when the app starts and user is online.
 */
export async function initSync() {
  if (!navigator.onLine) {
    console.log('[Sync] Offline — skipping initial sync');
    return;
  }

  console.log('[Sync] Starting initial sync...');
  // Pull remote data into local DB
  for (const col of COLLECTIONS) {
    await pullCollection(col);
  }
  // Push any local-only records up
  await pushAllLocal();
  // Start real-time listeners
  startRealtimeListeners();
  console.log('[Sync] Initial sync complete');
}
