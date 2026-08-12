import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { PackagePlus, X, Barcode, Check } from 'lucide-react';

export default function StockLogModal() {
  const { products, currentUser, setActiveModal, showToast } = useApp();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 1);
  const [logType, setLogType] = useState('stock_in'); // 'stock_in' | 'stock_out' | 'defective'
  const [quantity, setQuantity] = useState(1);
  const [imeiSerial, setImeiSerial] = useState('');
  const [reason, setReason] = useState('Supplier Delivery');

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const newStock = logType === 'stock_in' 
        ? selectedProduct.stock + parseInt(quantity) 
        : Math.max(0, selectedProduct.stock - parseInt(quantity));

      // Update product stock
      await db.products.update(selectedProduct.id, { stock: newStock });

      // Add to serialized items if IMEI specified
      if (imeiSerial && selectedProduct.isSerialized) {
        if (logType === 'stock_in') {
          await db.serializedItems.add({
            productId: selectedProduct.id,
            imeiSerial: imeiSerial,
            status: 'available'
          });
        }
      }

      // Add Stock Log
      await db.stockLogs.add({
        timestamp: new Date().toISOString(),
        type: logType,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        imeiSerial: imeiSerial || null,
        quantity: parseInt(quantity),
        reason: reason,
        clerkId: currentUser.id
      });

      showToast(`Stock updated: ${selectedProduct.name} now has ${newStock} units.`, 'success');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to update stock log', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Stock Movement Log</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Log Action Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'stock_in', label: 'Stock In (Inflow)' },
                { id: 'stock_out', label: 'Stock Out' },
                { id: 'defective', label: 'Defective / Return' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setLogType(t.id);
                    if (t.id === 'stock_in') setReason('Supplier Delivery');
                    else if (t.id === 'defective') setReason('Damaged / Defective Unit');
                    else setReason('Inventory Adjustment');
                  }}
                  className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                    logType === t.id
                      ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reason / Reference</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {selectedProduct?.isSerialized && (
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-400 flex items-center space-x-1 mb-1">
                <Barcode className="w-3.5 h-3.5" />
                <span>IMEI / Serial Number (Required for Phones)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 354892109834599"
                value={imeiSerial}
                onChange={(e) => setImeiSerial(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Record Stock Movement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
