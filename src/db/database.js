import Dexie from 'dexie';

export const db = new Dexie('GadgetPosDB');

db.version(1).stores({
  products: '++id, sku, name, category, brand, isSerialized, price, cost, stock',
  serializedItems: '++id, productId, imeiSerial, status',
  transactions: '++id, transactionNo, timestamp, clerkId, total, paymentMethod, status',
  cashLogs: '++id, timestamp, type, category, amount, clerkId',
  stockLogs: '++id, timestamp, type, productId, imeiSerial, quantity, clerkId',
  users: '++id, username, name, role, pin'
});

// Version 2: migrate users from username/pin → email/password
db.version(2).stores({
  products: '++id, sku, name, category, brand, isSerialized, price, cost, stock',
  serializedItems: '++id, productId, imeiSerial, status',
  transactions: '++id, transactionNo, timestamp, clerkId, total, paymentMethod, status',
  cashLogs: '++id, timestamp, type, category, amount, clerkId',
  stockLogs: '++id, timestamp, type, productId, imeiSerial, quantity, clerkId',
  users: '++id, email, name, role, password'
}).upgrade(async tx => {
  // Clear old pin/username user records so they get re-seeded with email/password
  await tx.table('users').clear();
  console.log('Upgraded users table to email/password schema');
});

export async function seedInitialData() {
  const count = await db.products.count();
  if (count > 0) return; // products already seeded

  console.log('Seeding initial product database...');

  // Initial Products
  const products = [
    {
      id: 1,
      sku: 'APL-IP15P-256NT',
      name: 'iPhone 15 Pro 256GB',
      brand: 'Apple',
      category: 'Smartphones',
      variant: 'Natural Titanium',
      isSerialized: true,
      price: 68990,
      cost: 62000,
      stock: 4,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      sku: 'SAM-S24U-512GB',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      brand: 'Samsung',
      category: 'Smartphones',
      variant: 'Titanium Black',
      isSerialized: true,
      price: 74990,
      cost: 67500,
      stock: 3,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      sku: 'XMI-14P-256GB',
      name: 'Xiaomi 14 Pro 256GB',
      brand: 'Xiaomi',
      category: 'Smartphones',
      variant: 'Emerald Green',
      isSerialized: true,
      price: 45990,
      cost: 40000,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      sku: 'ANK-737-24K',
      name: 'Anker 737 Power Bank 24,000mAh 140W',
      brand: 'Anker',
      category: 'Charging & Power',
      variant: 'Space Gray',
      isSerialized: false,
      price: 6490,
      cost: 4800,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1609592424089-980b15e44a49?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      sku: 'APL-APP2-USB',
      name: 'AirPods Pro 2nd Gen (USB-C)',
      brand: 'Apple',
      category: 'Audio',
      variant: 'White',
      isSerialized: true,
      price: 14990,
      cost: 12500,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 6,
      sku: 'SPG-IP15P-MAG',
      name: 'Spigen Ultra Hybrid MagFit Case (iPhone 15 Pro)',
      brand: 'Spigen',
      category: 'Cases & Protection',
      variant: 'Clear',
      isSerialized: false,
      price: 1450,
      cost: 850,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 7,
      sku: 'UGR-PD65W-GAN',
      name: 'UGREEN Nexode 65W GaN Charger 3-Port',
      brand: 'UGREEN',
      category: 'Charging & Power',
      variant: 'Metallic Gray',
      isSerialized: false,
      price: 1890,
      cost: 1200,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 8,
      sku: 'BEL-TEMPG-S24U',
      name: 'Belkin ScreenForce Tempered Glass (S24 Ultra)',
      brand: 'Belkin',
      category: 'Cases & Protection',
      variant: 'Clear',
      isSerialized: false,
      price: 990,
      cost: 450,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80'
    }
  ];

  await db.products.bulkAdd(products);

  // Serialized Items (IMEIs) for Phones & AirPods
  const serializedItems = [
    { productId: 1, imeiSerial: '354892109834501', status: 'available' },
    { productId: 1, imeiSerial: '354892109834502', status: 'available' },
    { productId: 1, imeiSerial: '354892109834503', status: 'available' },
    { productId: 1, imeiSerial: '354892109834504', status: 'available' },
    
    { productId: 2, imeiSerial: '358912093847101', status: 'available' },
    { productId: 2, imeiSerial: '358912093847102', status: 'available' },
    { productId: 2, imeiSerial: '358912093847103', status: 'available' },

    { productId: 3, imeiSerial: '864201092837401', status: 'available' },
    { productId: 3, imeiSerial: '864201092837402', status: 'available' },
    { productId: 3, imeiSerial: '864201092837403', status: 'available' },
    { productId: 3, imeiSerial: '864201092837404', status: 'available' },
    { productId: 3, imeiSerial: '864201092837405', status: 'available' },

    { productId: 5, imeiSerial: 'SN-AP2-88491021', status: 'available' },
    { productId: 5, imeiSerial: 'SN-AP2-88491022', status: 'available' },
    { productId: 5, imeiSerial: 'SN-AP2-88491023', status: 'available' },
    { productId: 5, imeiSerial: 'SN-AP2-88491024', status: 'available' }
  ];

  await db.serializedItems.bulkAdd(serializedItems);

  // Initial Shift Cash Float
  await db.cashLogs.add({
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'in',
    category: 'Opening Float',
    amount: 10000,
    notes: 'Shift starting cash float',
    clerkId: 3
  });

  // Seed sample transactions for analytics demonstrate instant live charts
  const sampleTransactions = [
    {
      transactionNo: 'TX-20260811-001',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      clerkId: 3,
      clerkName: 'Alex Cruz',
      items: [
        { productId: 6, name: 'Spigen Ultra Hybrid MagFit Case', price: 1450, quantity: 1 },
        { productId: 8, name: 'Belkin ScreenForce Tempered Glass', price: 990, quantity: 1 }
      ],
      subtotal: 2440,
      discount: 0,
      tax: 0,
      total: 2440,
      paymentMethod: 'Cash',
      amountTendered: 2500,
      change: 60,
      status: 'completed',
      receiptPhotoUrl: null
    },
    {
      transactionNo: 'TX-20260811-002',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      clerkId: 3,
      clerkName: 'Alex Cruz',
      items: [
        { productId: 1, name: 'iPhone 15 Pro 256GB', price: 68990, quantity: 1, imeiSerial: '354892109834500' },
        { productId: 6, name: 'Spigen Ultra Hybrid MagFit Case', price: 1450, quantity: 1 }
      ],
      subtotal: 70440,
      discount: 1000,
      tax: 0,
      total: 69440,
      paymentMethod: 'GCash',
      amountTendered: 69440,
      change: 0,
      status: 'completed',
      receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
    },
    {
      transactionNo: 'TX-20260812-003',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      clerkId: 2,
      clerkName: 'Sarah Miller',
      items: [
        { productId: 5, name: 'AirPods Pro 2nd Gen (USB-C)', price: 14990, quantity: 1, imeiSerial: 'SN-AP2-88491020' },
        { productId: 4, name: 'Anker 737 Power Bank 24,000mAh', price: 6490, quantity: 1 }
      ],
      subtotal: 21480,
      discount: 480,
      tax: 0,
      total: 21000,
      paymentMethod: 'Card',
      amountTendered: 21000,
      change: 0,
      status: 'completed',
      receiptPhotoUrl: null
    }
  ];

  await db.transactions.bulkAdd(sampleTransactions);

  console.log('Database seeded successfully!');
}
