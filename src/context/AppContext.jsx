import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, seedInitialData, seedDefaultUsers, DEFAULT_USERS } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { initSync, startRealtimeListeners, stopRealtimeListeners, pushToFirestore } from '../db/firestoreSync';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('storefront'); // 'storefront' | 'clerk' | 'owner'
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        // Redirect owners to owner dashboard, manager/clerk to clerk POS
        if (matched.role === 'owner') {
          setActiveRole('owner');
        } else {
          setActiveRole('clerk');
        }
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
      setActiveRole(role === 'manager' ? 'clerk' : role);
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
      const prod = await db.products.get(id);
      await db.products.delete(id);
      // In Firestore sync we can delete or update
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

  const switchRole = (role) => {
    if (role === 'storefront') {
      setActiveRole('storefront');
      return;
    }
    if (!isLoggedIn) {
      openAuthModal('login');
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
