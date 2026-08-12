import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, seedInitialData } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('clerk'); // 'public' | 'clerk' | 'owner'
  const [currentUser, setCurrentUser] = useState({ id: 3, name: 'Alex Cruz', role: 'clerk' });
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  
  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'receipt' | 'stock' | 'cash' | 'report' | 'pin'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Live queries from Dexie
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray(), []) || [];
  const cashLogs = useLiveQuery(() => db.cashLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const stockLogs = useLiveQuery(() => db.stockLogs.orderBy('timestamp').reverse().toArray(), []) || [];
  const serializedItems = useLiveQuery(() => db.serializedItems.toArray(), []) || [];

  useEffect(() => {
    seedInitialData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Cart operations
  const addToCart = (product, selectedImei = null) => {
    // Check stock available
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
      clerkId: currentUser.id,
      clerkName: currentUser.name,
      items: cart,
      subtotal,
      discount,
      tax: taxRate,
      total,
      paymentMethod,
      amountTendered: parseFloat(amountTendered) || total,
      change,
      status: 'completed',
      receiptPhotoUrl: null
    };

    try {
      // 1. Add transaction record
      const id = await db.transactions.add(tx);
      tx.id = id;

      // 2. Deduct stock for each item & update serialized status
      for (const item of cart) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          await db.products.update(item.productId, {
            stock: Math.max(0, prod.stock - item.quantity)
          });
        }

        if (item.imeiSerial) {
          const itemRecord = await db.serializedItems
            .where({ productId: item.productId, imeiSerial: item.imeiSerial })
            .first();
          if (itemRecord) {
            await db.serializedItems.update(itemRecord.id, { status: 'sold' });
          }
        }

        // Log stock movement
        await db.stockLogs.add({
          timestamp: new Date().toISOString(),
          type: 'stock_out',
          productId: item.productId,
          productName: item.name,
          imeiSerial: item.imeiSerial || null,
          quantity: item.quantity,
          reason: 'Customer Sale',
          clerkId: currentUser.id
        });
      }

      // 3. Log Cash In if Cash payment
      if (paymentMethod === 'Cash') {
        await db.cashLogs.add({
          timestamp: new Date().toISOString(),
          type: 'in',
          category: 'Sales Cash Collection',
          amount: total,
          notes: `Sales transaction ${txNo}`,
          clerkId: currentUser.id
        });
      }

      setSelectedTransaction(tx);
      clearCart();
      setActiveModal('receipt');
      showToast(`Transaction ${txNo} completed!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error processing transaction', 'error');
    }
  };

  const switchRole = (role) => {
    setActiveRole(role);
    if (role === 'owner') {
      setCurrentUser({ id: 1, name: 'John Barro (Owner)', role: 'owner' });
    } else if (role === 'clerk') {
      setCurrentUser({ id: 3, name: 'Alex Cruz (Clerk)', role: 'clerk' });
    } else {
      setCurrentUser({ id: 0, name: 'Public Visitor', role: 'public' });
    }
    showToast(`Switched view to ${role.toUpperCase()} mode`);
  };

  return (
    <AppContext.Provider value={{
      activeRole,
      switchRole,
      currentUser,
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
      subtotal,
      total,
      change,
      checkoutTransaction,
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
