import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit3, Save, X, Package, DollarSign, Tag, Image, ShieldAlert, Scan } from 'lucide-react';
import BarcodeScannerModal from './BarcodeScannerModal';

export default function ProductManager() {
  const { products, addProduct, editProduct, deleteProduct, showToast } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState('');
  const [isSerialized, setIsSerialized] = useState(false);

  // Global Keyboard Wedge Barcode Scanner Listener
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      
      // If delay between keystrokes is very fast (hardware scanners send text at < 30ms intervals)
      if (currentTime - lastKeyTime > 50) {
        buffer = ""; // Reset if typed too slowly manually
      }

      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const cleanCode = buffer.trim().toUpperCase();
          const match = products.find(p => p.sku.toUpperCase() === cleanCode);
          if (match) {
            handleEdit(match);
            showToast(`Scanned SKU: ${cleanCode} ✓ editing product`, 'success');
          } else {
            // If in form, set SKU field
            if (isAdding || editingId) {
              setSku(cleanCode);
              showToast(`Scanned SKU: ${cleanCode} set as field value`, 'success');
            } else {
              showToast(`Scanned SKU: ${cleanCode} not found in catalog`, 'info');
            }
          }
        }
        buffer = "";
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, isAdding, editingId]);

  const handleCameraScanSuccess = (decodedSku) => {
    const cleanCode = decodedSku.trim().toUpperCase();
    const match = products.find(p => p.sku.toUpperCase() === cleanCode);
    if (match) {
      handleEdit(match);
      showToast(`Scanned Product: ${match.name}`, 'success');
    } else {
      if (isAdding || editingId) {
        setSku(cleanCode);
        showToast(`SKU Barcode captured: ${cleanCode}`, 'success');
      } else {
        setIsAdding(true);
        setSku(cleanCode);
        showToast(`SKU ${cleanCode} not found. Pre-filling Add Form!`, 'info');
      }
    }
    setShowScanner(false);
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setCategory('Smartphones');
    setPrice('');
    setCost('');
    setStock('');
    setSku('');
    setImage('');
    setIsSerialized(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setBrand(p.brand || '');
    setCategory(p.category || 'Smartphones');
    setPrice(p.price || '');
    setCost(p.cost || '');
    setStock(p.stock || 0);
    setSku(p.sku || '');
    setImage(p.image || '');
    setIsSerialized(p.isSerialized || false);
    setIsAdding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !price || !stock) return;

    const data = {
      name: name.trim(),
      brand: brand.trim() || 'Generic',
      category,
      price: parseFloat(price),
      cost: parseFloat(cost) || 0,
      stock: parseInt(stock),
      sku: sku.trim().toUpperCase(),
      image: image.trim() || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500',
      isSerialized
    };

    let ok;
    if (editingId) {
      ok = await editProduct(editingId, data);
    } else {
      ok = await addProduct(data);
    }

    if (ok) resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-white">Product Catalog</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage details, variants, prices & stock levels</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Camera Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 active:scale-95 transition"
            title="Scan barcode with camera"
          >
            <Scan className="w-4 h-4" />
          </button>
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md shadow-cyan-500/25 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Scanner hint bar */}
      <div className="flex items-center space-x-2 bg-violet-500/5 border border-violet-500/15 rounded-xl px-3 py-2">
        <Scan className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <p className="text-[10px] text-slate-400">
          <span className="font-bold text-violet-300">Barcode Scanner Ready</span> — Use camera button above or plug in a USB/Bluetooth scanner gun and scan any product to instantly pull it up.
        </p>
      </div>

      {/* Add / Edit Form Panel */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-cyan-400">{editingId ? 'Edit Product Details' : 'Add New Product'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Product Name</label>
              <input
                type="text" required placeholder="iPhone 16 Pro Max 512GB" value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-semibold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Brand</label>
              <input
                type="text" placeholder="Apple" value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-semibold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">SKU Code</label>
              <div className="flex items-center space-x-1">
                <input
                  type="text" required placeholder="APL-IP16PM-512" value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                />
                <button type="button" onClick={() => setShowScanner(true)}
                  className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 hover:bg-violet-500/20 shrink-0"
                  title="Scan barcode to fill SKU">
                  <Scan className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-semibold focus:border-cyan-500 focus:outline-none"
              >
                <option value="Smartphones">Smartphones</option>
                <option value="Charging & Power">Charging & Power</option>
                <option value="Audio">Audio</option>
                <option value="Cases & Protection">Cases & Protection</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1">
              <input
                type="checkbox" id="isSerialized" checked={isSerialized}
                onChange={e => setIsSerialized(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <label htmlFor="isSerialized" className="text-[10px] font-bold text-slate-400 select-none cursor-pointer">Has IMEI / Serials</label>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Selling Price (₱)</label>
              <input
                type="number" required placeholder="89990" value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Dealer Cost (₱)</label>
              <input
                type="number" placeholder="78000" value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Initial Stock Level</label>
              <input
                type="number" required placeholder="5" value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Image URL (optional)</label>
              <input
                type="text" placeholder="https://..." value={image}
                onChange={e => setImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-400 focus:border-cyan-500 focus:outline-none text-[10px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button" onClick={resetForm}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingId ? 'Update Product' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Products list */}
      <div className="flex-1 overflow-y-auto space-y-2.5">
        {products.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex items-center justify-between hover:border-slate-800 transition">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <img src={p.image || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500'} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-950 text-slate-400 border border-slate-800">{p.sku}</span>
                  {p.isSerialized && <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">IMEI</span>}
                </div>
                <p className="text-xs font-bold text-white mt-1 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500">Stock: <span className={p.stock <= 3 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{p.stock} units</span> · Cost: ₱{(p.cost || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 ml-3">
              <div className="text-right">
                <p className="text-xs font-black text-cyan-400">₱{(p.price || 0).toLocaleString()}</p>
                <p className="text-[9px] text-slate-500">{p.category}</p>
              </div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/25 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleCameraScanSuccess}
        />
      )}
    </div>
  );
}
