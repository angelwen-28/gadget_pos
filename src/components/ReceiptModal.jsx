import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { 
  Printer, 
  Camera, 
  CheckCircle, 
  X, 
  Barcode, 
  Download, 
  Upload, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ReceiptModal() {
  const { selectedTransaction, setSelectedTransaction, setActiveModal, showToast } = useApp();
  const [photoUrl, setPhotoUrl] = useState(selectedTransaction?.receiptPhotoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  if (!selectedTransaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoSimulate = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setPhotoUrl(base64);
        try {
          await db.transactions.update(selectedTransaction.id, { receiptPhotoUrl: base64 });
          selectedTransaction.receiptPhotoUrl = base64;
          showToast('Receipt verification photo attached successfully!', 'success');
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Simulate quick sample capture photo if no file uploaded
      const samplePhoto = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
      setPhotoUrl(samplePhoto);
      await db.transactions.update(selectedTransaction.id, { receiptPhotoUrl: samplePhoto });
      selectedTransaction.receiptPhotoUrl = samplePhoto;
      showToast('Simulated receipt photo capture attached!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-xl w-full p-6 space-y-6 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Receipt & Digital Verification Trail</h3>
              <p className="text-xs text-slate-400">Transaction: {selectedTransaction.transactionNo}</p>
            </div>
          </div>

          <button 
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-center">
          <div id="printable-receipt" className="bg-white text-black p-5 rounded-lg w-full max-w-xs font-mono text-xs shadow-md space-y-3">
            
            <div className="text-center border-b border-dashed border-gray-400 pb-3">
              <h2 className="font-extrabold text-sm uppercase">OPTIMA GADGETS</h2>
              <p className="text-[10px]">Cyberzone Bldg, Commercial Ave</p>
              <p className="text-[10px]">VAT Reg TIN: 009-823-145-000</p>
              <p className="text-[10px] mt-1 font-bold">OFFICIAL RECEIPT</p>
            </div>

            <div className="text-[10px] space-y-0.5 border-b border-dashed border-gray-400 pb-2">
              <p>Receipt No: <strong>{selectedTransaction.transactionNo}</strong></p>
              <p>Date: {new Date(selectedTransaction.timestamp).toLocaleString()}</p>
              <p>Clerk: {selectedTransaction.clerkName}</p>
              <p>Payment: <strong>{selectedTransaction.paymentMethod}</strong></p>
            </div>

            {/* Line Items */}
            <div className="space-y-1.5 border-b border-dashed border-gray-400 pb-3">
              {selectedTransaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{item.name}</span>
                    <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>{item.quantity} x ₱{item.price.toLocaleString()}</span>
                    {item.imeiSerial && <span className="font-mono text-[9px]">SN: {item.imeiSerial}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{selectedTransaction.subtotal.toLocaleString()}</span>
              </div>
              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between font-semibold">
                  <span>Discount:</span>
                  <span>-₱{selectedTransaction.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm border-t border-black pt-1">
                <span>TOTAL:</span>
                <span>₱{selectedTransaction.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Tendered:</span>
                <span>₱{selectedTransaction.amountTendered.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Change:</span>
                <span>₱{selectedTransaction.change.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-600">
              <p>Thank you for buying at Optima Gadgets!</p>
              <p>Warranty valid with receipt & matching serial.</p>
            </div>
          </div>
        </div>

        {/* Section 4.1 Requirement: Photo/screenshot capture of receipt */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Receipt Verification Photo Attachment</h4>
            </div>
            {photoUrl ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                Verified
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                Pending Capture
              </span>
            )}
          </div>

          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44">
              <img src={photoUrl} alt="Receipt Photo Verification" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded text-[10px] text-slate-200 font-mono border border-slate-700">
                Timestamped: {new Date().toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">Capture or upload photo of physical issued receipt for verification trail</p>
              <div className="flex justify-center space-x-3">
                <label className="cursor-pointer px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition inline-flex items-center space-x-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoSimulate} className="hidden" />
                </label>

                <button 
                  onClick={() => handlePhotoSimulate({})}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Simulate Camera Capture</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt</span>
          </button>

          <button
            onClick={() => setActiveModal(null)}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
