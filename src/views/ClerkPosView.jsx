import React, { useState } from 'react';
import MobileAppFrame from '../components/MobileAppFrame';
import { useApp } from '../context/AppContext';
import {
  Search, Plus, Minus, Trash2, Barcode, CreditCard, Banknote,
  QrCode, Receipt, X, ShoppingCart, Package, DollarSign,
  PackagePlus, Check, ChevronLeft, Home, LayoutGrid, ClipboardList
} from 'lucide-react';

const CATEGORIES = ['All', 'Smartphones', 'Charging & Power', 'Audio', 'Cases & Protection'];
const PAYMENT_METHODS = [
  { id: 'Cash', icon: <Banknote className="w-5 h-5" /> },
  { id: 'GCash', icon: <QrCode className="w-5 h-5" /> },
  { id: 'Card', icon: <CreditCard className="w-5 h-5" /> },
];

export default function ClerkPosView() {
  const {
    products, serializedItems,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
    discount, setDiscount,
    paymentMethod, setPaymentMethod,
    amountTendered, setAmountTendered,
    subtotal, total, change,
    checkoutTransaction,
    setActiveModal, showToast,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'cart' | 'stock' | 'cashlog'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [imeiModal, setImeiModal] = useState(null); // { product, imeis }
  const [stockScreen, setStockScreen] = useState(false);
  const [cashScreen, setCashScreen] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleProductTap = (product) => {
    if (product.stock <= 0) { showToast('Out of stock', 'error'); return; }
    if (product.isSerialized) {
      const avail = serializedItems.filter(s => s.productId === product.id && s.status === 'available');
      if (!avail.length) { showToast('No available serial units', 'error'); return; }
      setImeiModal({ product, imeis: avail });
    } else {
      addToCart(product);
    }
  };

  const tabs = [
    { id: 'products', icon: <LayoutGrid className="w-5 h-5" />, label: 'Products' },
    { id: 'cart', icon: <ShoppingCart className="w-5 h-5" />, label: 'Cart', badge: cart.length },
    { id: 'stock', icon: <PackagePlus className="w-5 h-5" />, label: 'Stock' },
    { id: 'cashlog', icon: <DollarSign className="w-5 h-5" />, label: 'Cash' },
  ];

  return (
    <MobileAppFrame statusLabel="Counter POS Terminal — Clerk Mode" statusColor="cyan">
      {/* App Header */}
      <div className="px-4 pt-1 pb-3 flex items-center justify-between bg-slate-950 border-b border-slate-800/80">
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-tight">Optima POS</h1>
          <p className="text-[10px] text-slate-400">{currentUser.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          {cart.length > 0 && activeTab !== 'cart' && (
            <button
              onClick={() => setActiveTab('cart')}
              className="relative px-2.5 py-1.5 bg-cyan-600 rounded-xl text-white text-[10px] font-bold flex items-center space-x-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>₱{total.toLocaleString()}</span>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] font-extrabold flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── PRODUCTS SCREEN ── */}
      {activeTab === 'products' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-4 py-2.5 bg-slate-950">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search model, SKU, IMEI..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex overflow-x-auto space-x-2 px-4 py-2 scrollbar-hide shrink-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductTap(product)}
                disabled={product.stock === 0}
                className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl border transition text-left ${
                  product.stock > 0
                    ? 'bg-slate-900 border-slate-800 active:bg-slate-800 active:scale-[0.98]'
                    : 'bg-slate-900/40 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{product.variant}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-extrabold text-cyan-400">₱{product.price.toLocaleString()}</span>
                    {product.isSerialized && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded font-bold border border-amber-500/20 flex items-center space-x-0.5">
                        <Barcode className="w-2.5 h-2.5" /><span>IMEI</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-1">
                        <Plus className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-[10px] text-slate-500">{product.stock} left</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-bold">Out</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CART SCREEN ── */}
      {activeTab === 'cart' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-2 pb-1 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white">Current Sale</h2>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] text-rose-400 font-bold flex items-center space-x-1">
                <Trash2 className="w-3.5 h-3.5" /><span>Clear</span>
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <ShoppingCart className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-400">Cart is empty</p>
              <p className="text-xs text-slate-600 mt-1">Go to Products tab and tap items to add</p>
              <button onClick={() => setActiveTab('products')} className="mt-4 px-5 py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-xl">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        {item.imeiSerial && (
                          <p className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {item.imeiSerial}
                          </p>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="text-slate-600 hover:text-rose-400 transition p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-slate-800 rounded-xl p-1">
                        <button onClick={() => updateCartQuantity(idx, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-white w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(idx, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-cyan-400">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment panel */}
              <div className="px-4 pb-2 pt-3 border-t border-slate-800 space-y-3 bg-slate-950">
                {/* Payment Method */}
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex flex-col items-center py-2.5 rounded-2xl text-[10px] font-bold border transition space-y-1 ${
                        paymentMethod === pm.id
                          ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {pm.icon}
                      <span>{pm.id}</span>
                    </button>
                  ))}
                </div>

                {/* Discount + Tendered */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Discount ₱</p>
                    <input
                      type="number" placeholder="0"
                      value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm font-extrabold text-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">
                      {paymentMethod === 'Cash' ? 'Tendered ₱' : 'Ref / Amt'}
                    </p>
                    <input
                      type="number" placeholder={total.toString()}
                      value={amountTendered} onChange={e => setAmountTendered(e.target.value)}
                      className="w-full bg-transparent text-sm font-extrabold text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Summary row */}
                <div className="flex items-center justify-between py-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Total Due</span>
                  <span className="text-xl font-extrabold text-white">₱{total.toLocaleString()}</span>
                </div>
                {paymentMethod === 'Cash' && change > 0 && (
                  <div className="flex items-center justify-between -mt-1">
                    <span className="text-[11px] text-slate-500">Change</span>
                    <span className="text-sm font-bold text-amber-400">₱{change.toLocaleString()}</span>
                  </div>
                )}

                {/* Ring Up Button */}
                <button
                  onClick={checkoutTransaction}
                  disabled={cart.length === 0}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition disabled:opacity-50"
                >
                  <Receipt className="w-5 h-5" />
                  <span>Ring Up & Print Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STOCK IN/OUT SCREEN ── */}
      {activeTab === 'stock' && (
        <StockScreen products={products} currentUser={currentUser} showToast={showToast} />
      )}

      {/* ── CASH LOG SCREEN ── */}
      {activeTab === 'cashlog' && (
        <CashScreen currentUser={currentUser} showToast={showToast} />
      )}

      {/* Bottom Navigation */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-2 pb-1">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 space-y-0.5 relative transition ${
                activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-bold">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-1.5 right-3 w-4 h-4 bg-emerald-500 text-[8px] text-white font-extrabold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* IMEI Selection Bottom Sheet */}
      {imeiModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setImeiModal(null)} />
          <div className="relative bg-slate-900 rounded-t-3xl border-t border-slate-800 p-5 space-y-4 shadow-2xl">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">Select Unit IMEI</h3>
                <p className="text-[11px] text-slate-400 truncate">{imeiModal.product.name}</p>
              </div>
              <button onClick={() => setImeiModal(null)} className="text-slate-500 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {imeiModal.imeis.map(item => (
                <button
                  key={item.id}
                  onClick={() => { addToCart(imeiModal.product, item.imeiSerial); setImeiModal(null); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-[0.98]"
                >
                  <span className="font-mono text-xs text-slate-200 font-semibold">{item.imeiSerial}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Available</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileAppFrame>
  );
}

/* ─── Stock In/Out inline screen ─── */
function StockScreen({ products, currentUser, showToast }) {
  const { db: database } = useApp();
  const [form, setForm] = useState({ productId: products[0]?.id || 1, type: 'stock_in', qty: 1, imei: '', reason: 'Supplier Delivery' });
  const { db: _db } = useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { db } = await import('../db/database');
      const prod = await db.products.get(parseInt(form.productId));
      if (!prod) return;
      const newStock = form.type === 'stock_in' ? prod.stock + parseInt(form.qty) : Math.max(0, prod.stock - parseInt(form.qty));
      await db.products.update(prod.id, { stock: newStock });
      if (form.imei && prod.isSerialized && form.type === 'stock_in') {
        await db.serializedItems.add({ productId: prod.id, imeiSerial: form.imei, status: 'available' });
      }
      await db.stockLogs.add({ timestamp: new Date().toISOString(), type: form.type, productId: prod.id, productName: prod.name, imeiSerial: form.imei || null, quantity: parseInt(form.qty), reason: form.reason, clerkId: currentUser.id });
      showToast(`Stock updated! ${prod.name}: ${newStock} units`, 'success');
      setForm(f => ({ ...f, qty: 1, imei: '' }));
    } catch (e) { showToast('Error updating stock', 'error'); }
    setLoading(false);
  };

  const selectedProduct = products.find(p => p.id === parseInt(form.productId));

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <h2 className="text-sm font-extrabold text-white">Stock Movement Log</h2>

      <div className="space-y-3">
        {/* Type selector */}
        <div className="grid grid-cols-2 gap-2">
          {[{ id: 'stock_in', label: '↑ Stock In', color: 'emerald' }, { id: 'stock_out', label: '↓ Stock Out', color: 'rose' }].map(t => (
            <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
              className={`py-3 rounded-2xl text-xs font-bold border transition ${
                form.type === t.id
                  ? t.color === 'emerald' ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50' : 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Product</p>
            <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Quantity</p>
              <input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-200 focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Reason</p>
              <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          {selectedProduct?.isSerialized && (
            <div>
              <p className="text-[10px] text-amber-400 uppercase font-bold mb-1.5 flex items-center space-x-1">
                <Barcode className="w-3 h-3" /><span>IMEI / Serial #</span>
              </p>
              <input type="text" placeholder="354892109834599" value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))}
                className="w-full bg-slate-800 border border-amber-500/30 rounded-xl px-3 py-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500" />
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-60">
          <Check className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Record Stock Movement'}</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Cash log inline screen ─── */
function CashScreen({ currentUser, showToast }) {
  const [form, setForm] = useState({ type: 'out', category: 'Store Expense', amount: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast('Enter a valid amount', 'error'); return; }
    setLoading(true);
    try {
      const { db } = await import('../db/database');
      await db.cashLogs.add({ timestamp: new Date().toISOString(), type: form.type, category: form.category, amount: parseFloat(form.amount), notes: form.notes || 'Counter entry', clerkId: currentUser.id });
      showToast(`Cash ${form.type === 'in' ? 'In' : 'Out'}: ₱${parseFloat(form.amount).toLocaleString()} recorded`, 'success');
      setForm(f => ({ ...f, amount: '', notes: '' }));
    } catch { showToast('Error saving entry', 'error'); }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <h2 className="text-sm font-extrabold text-white">Shift Cash Flow Log</h2>
      <div className="grid grid-cols-2 gap-2">
        {[{ t: 'in', label: '+ Cash In' }, { t: 'out', label: '- Cash Out' }].map(({ t, label }) => (
          <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === 'in' ? 'Cash Addition / Float' : 'Store Expense' }))}
            className={`py-3 rounded-2xl text-xs font-bold border transition ${
              form.type === t
                ? t === 'in' ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50' : 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>{label}</button>
        ))}
      </div>
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Category</p>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500">
            {form.type === 'in'
              ? ['Cash Addition / Float', 'Owner Capital Inject', 'Other Cash In'].map(c => <option key={c}>{c}</option>)
              : ['Store Expense', 'Supplier Payment', 'Bank Cash Drop', 'Refund Issued'].map(c => <option key={c}>{c}</option>)
            }
          </select>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Amount (₱)</p>
          <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xl font-extrabold text-slate-200 focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Notes</p>
          <input type="text" placeholder="e.g. Lunch for 2 staff" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500" />
        </div>
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-60">
        <Check className="w-5 h-5" />
        <span>{loading ? 'Saving...' : 'Log Cash Entry'}</span>
      </button>
    </div>
  );
}
