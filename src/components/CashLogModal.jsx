import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { DollarSign, X, Check } from 'lucide-react';

export default function CashLogModal() {
  const { currentUser, setActiveModal, showToast } = useApp();
  const [logType, setLogType] = useState('out'); // 'in' | 'out'
  const [category, setCategory] = useState('Store Expense');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid cash amount', 'error');
      return;
    }

    try {
      await db.cashLogs.add({
        timestamp: new Date().toISOString(),
        type: logType,
        category: category,
        amount: parseFloat(amount),
        notes: notes || 'Counter log entry',
        clerkId: currentUser.id
      });

      showToast(`Recorded Cash ${logType.toUpperCase()}: ₱${parseFloat(amount).toLocaleString()}`, 'success');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      showToast('Error recording cash entry', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Shift Cash Flow Log</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cash Movement Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogType('in');
                  setCategory('Cash Addition / Float');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                  logType === 'in'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                + Cash In (Float Add)
              </button>

              <button
                type="button"
                onClick={() => {
                  setLogType('out');
                  setCategory('Store Expense');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                  logType === 'out'
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                - Cash Out (Expense)
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {logType === 'in' ? (
                <>
                  <option value="Cash Addition / Float">Cash Addition / Float</option>
                  <option value="Owner Capital Inject">Owner Capital Inject</option>
                  <option value="Other Cash In">Other Cash In</option>
                </>
              ) : (
                <>
                  <option value="Store Expense">Store Expense (Supplies/Meals)</option>
                  <option value="Supplier Payment">Supplier Payment</option>
                  <option value="Bank Cash Drop">Bank Cash Drop / Vault</option>
                  <option value="Refund Issued">Refund Issued</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Amount (₱)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. Purchased receipt paper rolls"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Log Cash Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
