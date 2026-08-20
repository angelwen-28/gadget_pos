import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, seedInitialData, seedDefaultUsers, DEFAULT_USERS } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { initSync, startRealtimeListeners, stopRealtimeListeners, pushToFirestore } from '../db/firestoreSync';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Restore session from localStorage (so refresh doesn't log out)
  const savedSession = (() => {
    try { return JSON.parse(localStorage.getItem('pos_session')); } catch { return null; }
  })();

  const [activeRole, setActiveRole] = useState(savedSession?.activeRole || 'storefront');
  const [currentUser, setCurrentUser] = useState(savedSession?.currentUser || null);
  const [isLoggedIn, setIsLoggedIn] = useState(savedSession?.isLoggedIn || false);

  // Sync session state to localStorage
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      localStorage.setItem('pos_session', JSON.stringify({
        currentUser,
        isLoggedIn,
        activeRole
      }));
    } else {
      localStorage.removeItem('pos_session');
    }
  }, [currentUser, isLoggedIn, activeRole]);

  // Cart State
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [warranty, setWarranty] = useState('');
  
  // Modals & UI State
  const [activeModal, setActiveModal] = useState(null); // 'receipt' | 'stock' | 'cash' | 'report' | 'auth' | 'install'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // PWA Deferred Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  // Live queries from Dexie
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray(), []) || [];
  const cashLogs = useLiveQuery(() => db.cashLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const stockLogs = useLiveQuery(() => db.stockLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const serializedItems = useLiveQuery(() => db.serializedItems.toArray(), []) || [];
  const users = useLiveQuery(() => db.users.toArray(), []) || [];
  const announcements = useLiveQuery(() => db.announcements.toArray(), []) || [];
  const rawStoreSettings = useLiveQuery(() => db.storeSettings.toArray(), []) || [];

  // Convert rawStoreSettings list to a lookup map
  const storeSettings = rawStoreSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  useEffect(() => {
    seedInitialData();
    // Seed users locally then push to Firestore (no circular dep here)
    seedDefaultUsers().then(() => {
      DEFAULT_USERS.forEach(u => pushToFirestore('users', u));
    });

    // Start Firebase sync (pull remote → local, push local → remote, real-time listeners)
    initSync();

    const handleOnline = () => {
      setIsOnline(true);
      startRealtimeListeners(); // Resume real-time sync when back online
    };
    const handleOffline = () => {
      setIsOnline(false);
      stopRealtimeListeners(); // Pause listeners when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      stopRealtimeListeners();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Auth Operations
  const loginUser = async (email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      // Strict match: email must match exactly (case-insensitive) AND password must match
      const matched = users.find(u =>
        u.email?.toLowerCase() === cleanEmail &&
        u.password === password
      );

      if (matched) {
        setCurrentUser(matched);
        setIsLoggedIn(true);
        // Redirect by role: owner → owner dashboard, manager → manager dashboard, clerk → POS
        const role = matched.role === 'owner' ? 'owner' : matched.role === 'manager' ? 'manager' : 'clerk';
        setActiveRole(role);
        // Persist session to localStorage
        localStorage.setItem('pos_session', JSON.stringify({
          currentUser: matched,
          isLoggedIn: true,
          activeRole: role
        }));
        setActiveModal(null);
        showToast(`Welcome back, ${matched.name}!`);
        return true;
      } else {
        showToast('Invalid email or password.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      showToast('Login failed. Please try again.', 'error');
      return false;
    }
  };

  const signUpUser = async ({ name, email, role = 'owner', password }) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const existing = users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        showToast('An account with this email already exists.', 'error');
        return false;
      }

      const id = await db.users.add({
        name: name.trim(),
        email: cleanEmail,
        role,
        password
      });

      const newUser = { id, name: name.trim(), email: cleanEmail, role, password };
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      const newRole = role === 'manager' ? 'clerk' : role;
      setActiveRole(newRole);
      // Persist session
      localStorage.setItem('pos_session', JSON.stringify({
        currentUser: newUser,
        isLoggedIn: true,
        activeRole: newRole
      }));
      setActiveModal(null);
      showToast(`Account created! Welcome, ${newUser.name}!`);
      return true;
    } catch (err) {
      console.error(err);
      showToast('Failed to create account.', 'error');
      return false;
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveRole('storefront');
    localStorage.removeItem('pos_session');
    showToast('Logged out successfully');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setActiveModal('auth');
  };

  // Trigger PWA Installation
  const promptInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('App installed successfully!');
        setDeferredPrompt(null);
        setCanInstallPWA(false);
      }
    } else {
      setActiveModal('install');
    }
  };

  // Cart operations
  const addToCart = (product, selectedImei = null) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is out of stock!`, 'error');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id && item.imeiSerial === selectedImei
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        if (updated[existingIndex].quantity + 1 > product.stock) {
          showToast(`Cannot add more than available stock (${product.stock})`, 'error');
          return prev;
        }
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          variant: product.variant,
          category: product.category,
          price: product.price,
          isSerialized: product.isSerialized,
          imeiSerial: selectedImei,
          quantity: 1,
          image: product.image
        }];
      }
    });

    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index, qty) => {
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = qty;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountTendered('');
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount + (subtotal * (taxRate / 100)));
  const change = Math.max(0, (parseFloat(amountTendered) || 0) - total);

  // Complete Transaction
  const checkoutTransaction = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    if (paymentMethod === 'Cash' && (parseFloat(amountTendered) || 0) < total) {
      showToast(`Tendered amount (₱${amountTendered || 0}) is less than Total (₱${total.toLocaleString()})`, 'error');
      return;
    }

    const txNo = `TX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`;
    const tx = {
      transactionNo: txNo,
      timestamp: new Date().toISOString(),
      clerkId: currentUser.id || 3,
      clerkName: currentUser.name || 'Clerk Staff',
      items: cart,
      subtotal,
      discount,
      tax: taxRate,
      total,
      paymentMethod,
      amountTendered: parseFloat(amountTendered) || total,
      change,
      status: 'completed',
      receiptPhotoUrl: null,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerContact: customerContact.trim() || '',
      warranty: warranty.trim() || '',
    };

    try {
      const id = await db.transactions.add(tx);
      tx.id = id;
      // Sync transaction to Firestore
      pushToFirestore('transactions', tx);

      for (const item of cart) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db.products.update(item.productId, { stock: newStock });
          // Sync updated product stock to Firestore
          pushToFirestore('products', { ...prod, stock: newStock });
        }

        if (item.imeiSerial) {
          const itemRecord = await db.serializedItems
            .where({ productId: item.productId, imeiSerial: item.imeiSerial })
            .first();
          if (itemRecord) {
            await db.serializedItems.update(itemRecord.id, { status: 'sold' });
          }
        }

        const stockLogId = await db.stockLogs.add({
          timestamp: new Date().toISOString(),
          type: 'stock_out',
          productId: item.productId,
          productName: item.name,
          imeiSerial: item.imeiSerial || null,
          quantity: item.quantity,
          reason: 'Customer Sale',
          clerkId: currentUser.id || 3
        });
        // Sync stock log to Firestore
        pushToFirestore('stockLogs', {
          id: stockLogId,
          timestamp: new Date().toISOString(),
          type: 'stock_out',
          productId: item.productId,
          productName: item.name,
          imeiSerial: item.imeiSerial || null,
          quantity: item.quantity,
          reason: 'Customer Sale',
          clerkId: currentUser.id || 3
        });
      }

      if (paymentMethod === 'Cash') {
        const cashLogId = await db.cashLogs.add({
          timestamp: new Date().toISOString(),
          type: 'in',
          category: 'Sales Cash Collection',
          amount: total,
          notes: `Sales transaction ${txNo}`,
          clerkId: currentUser.id || 3
        });
        // Sync cash log to Firestore
        pushToFirestore('cashLogs', {
          id: cashLogId,
          timestamp: new Date().toISOString(),
          type: 'in',
          category: 'Sales Cash Collection',
          amount: total,
          notes: `Sales transaction ${txNo}`,
          clerkId: currentUser.id || 3
        });
      }

      setSelectedTransaction(tx);
      clearCart();
      setCustomerName('');
      setCustomerContact('');
      setWarranty('');
      setActiveModal('receipt');
      showToast(`Transaction ${txNo} completed!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error processing transaction', 'error');
    }
  };

  const addProduct = async (productData) => {
    try {
      const id = await db.products.add(productData);
      const newProd = { ...productData, id };
      pushToFirestore('products', newProd);
      showToast(`Product ${productData.name} added!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error adding product', 'error');
      return false;
    }
  };

  const editProduct = async (id, updatedData) => {
    try {
      await db.products.update(id, updatedData);
      const updatedProd = await db.products.get(id);
      pushToFirestore('products', updatedProd);
      showToast(`Product updated!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error updating product', 'error');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Record tombstone so Firestore pull won't re-add this product
      await db.deletedIds.put({ id: String(id), collection: 'products', deletedAt: new Date().toISOString() });
      // Delete locally
      await db.products.delete(id);
      // Delete from Firestore
      try {
        const { db: firestore } = await import('../db/firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestore, 'products', id.toString()));
      } catch (fe) {
        console.warn("Could not sync deletion to Firestore:", fe);
      }
      showToast(`Product deleted!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error deleting product', 'error');
      return false;
    }
  };

  const addAnnouncement = async (announcementData) => {
    try {
      const timestamp = new Date().toISOString();
      const record = { ...announcementData, timestamp };
      const id = await db.announcements.add(record);
      const newRecord = { ...record, id };
      pushToFirestore('announcements', newRecord);
      showToast(`Announcement/Event "${announcementData.title}" created!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error creating announcement', 'error');
      return false;
    }
  };

  const editAnnouncement = async (id, updatedData) => {
    try {
      await db.announcements.update(id, updatedData);
      const record = await db.announcements.get(id);
      pushToFirestore('announcements', record);
      showToast('Announcement/Event updated!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error updating announcement', 'error');
      return false;
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await db.announcements.delete(id);
      try {
        const { db: firestore } = await import('../db/firebase');
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestore, 'announcements', id.toString()));
      } catch (fe) {
        console.warn("Could not sync deletion to Firestore:", fe);
      }
      showToast('Announcement/Event deleted!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error deleting announcement', 'error');
      return false;
    }
  };

  const updateStoreSetting = async (key, value) => {
    try {
      await db.storeSettings.put({ key, value });
      pushToFirestore('storeSettings', { key, value });
      showToast('Store settings updated!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error updating settings', 'error');
      return false;
    }
  };

  const resetDatabase = async () => {
    try {
      // Stop real-time listeners during reset
      stopRealtimeListeners();

      // Clear ALL local Dexie tables
      await db.products.clear();
      await db.serializedItems.clear();
      await db.transactions.clear();
      await db.cashLogs.clear();
      await db.stockLogs.clear();
      await db.announcements.clear();
      await db.storeSettings.clear();
      await db.deletedIds.clear();
      // Keep users so login still works

      // Clear Firestore collections (products, transactions, cashLogs, stockLogs, announcements, storeSettings)
      try {
        const { db: firestore } = await import('../db/firebase');
        const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const collectionsToReset = ['products', 'transactions', 'cashLogs', 'stockLogs', 'announcements', 'storeSettings', 'stockLogs'];
        for (const col of collectionsToReset) {
          const snap = await getDocs(collection(firestore, col));
          for (const d of snap.docs) {
            await deleteDoc(doc(firestore, col, d.id));
          }
        }
      } catch (fe) {
        console.warn('Firestore reset partial error:', fe);
      }

      // Re-seed default data
      await seedInitialData(true);
      await seedDefaultUsers();

      // Restart real-time listeners
      startRealtimeListeners();

      showToast('Database reset successfully!', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error resetting database', 'error');
      return false;
    }
  };

  const switchRole = (role) => {
    if (role === 'storefront') {
      setActiveRole('storefront');
      return;
    }
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    // RBAC: clerk cannot navigate to owner/manager dashboards
    if (role === 'owner' && currentUser?.role !== 'owner') {
      showToast('Access restricted to Owner only', 'error');
      return;
    }
    if (role === 'manager' && currentUser?.role !== 'manager' && currentUser?.role !== 'owner') {
      showToast('Access restricted to Manager or Owner', 'error');
      return;
    }
    setActiveRole(role);
  };

  return (
    <AppContext.Provider value={{
      activeRole,
      switchRole,
      currentUser,
      isLoggedIn,
      users,
      loginUser,
      signUpUser,
      logoutUser,
      authMode,
      openAuthModal,
      promptInstallPWA,
      canInstallPWA,
      products,
      transactions,
      cashLogs,
      stockLogs,
      serializedItems,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      discount,
      setDiscount,
      taxRate,
      setTaxRate,
      paymentMethod,
      setPaymentMethod,
      amountTendered,
      setAmountTendered,
      customerName,
      setCustomerName,
      customerContact,
      setCustomerContact,
      warranty,
      setWarranty,
      subtotal,
      total,
      change,
      checkoutTransaction,
      addProduct,
      editProduct,
      deleteProduct,
      announcements,
      storeSettings,
      addAnnouncement,
      editAnnouncement,
      deleteAnnouncement,
      updateStoreSetting,
      resetDatabase,
      activeModal,
      setActiveModal,
      selectedTransaction,
      setSelectedTransaction,
      notification,
      showToast,
      isOnline
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
