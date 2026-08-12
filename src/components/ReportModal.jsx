import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, X, Calendar, Database, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ReportModal() {
  const { transactions, products, cashLogs, stockLogs, setActiveModal, showToast } = useApp();
  const [reportType, setReportType] = useState('daily'); // 'daily' | 'cash_flow' | 'inventory' | 'best_sellers'
  const [reportFormat, setReportFormat] = useState('pdf'); // 'pdf' | 'excel'

  const totalSales = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
  const cashIn = cashLogs.filter(c => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
  const cashOut = cashLogs.filter(c => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);
  const runningCash = cashIn - cashOut;

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(18);
    doc.text('OPTIMA GADGETS RETAIL SYSTEM', 14, 20);
    doc.setFontSize(12);
    doc.text(`Official Executive Report: ${reportType.toUpperCase().replace('_', ' ')}`, 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${dateStr} | Author: John Barro (Owner)`, 14, 34);
    doc.line(14, 38, 196, 38);

    let y = 46;

    if (reportType === 'daily') {
      doc.setFontSize(12);
      doc.text('Daily / Period Sales Summary', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Total Transactions: ${transactions.length}`, 14, y); y += 6;
      doc.text(`Gross Revenue: PHP ${totalSales.toLocaleString()}`, 14, y); y += 6;
      doc.text(`Est. Net Profit: PHP ${(totalSales * 0.25).toLocaleString()}`, 14, y); y += 12;

      doc.setFontSize(11);
      doc.text('Recent Transactions Breakdown:', 14, y); y += 8;
      doc.setFontSize(9);
      transactions.forEach((tx) => {
        doc.text(`${tx.transactionNo} | ${tx.clerkName} | ${tx.paymentMethod} | PHP ${tx.total.toLocaleString()}`, 14, y);
        y += 6;
      });
    } else if (reportType === 'cash_flow') {
      doc.setFontSize(12);
      doc.text('Cash Flow Statement', 14, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Total Cash In (Float & Sales): PHP ${cashIn.toLocaleString()}`, 14, y); y += 6;
      doc.text(`Total Cash Out (Expenses/Drops): PHP ${cashOut.toLocaleString()}`, 14, y); y += 6;
      doc.text(`Net Counter Balance: PHP ${runningCash.toLocaleString()}`, 14, y); y += 12;

      doc.setFontSize(11);
      doc.text('Cash Activity Log:', 14, y); y += 8;
      doc.setFontSize(9);
      cashLogs.forEach(c => {
        doc.text(`[${c.type.toUpperCase()}] ${c.category}: PHP ${c.amount.toLocaleString()} (${c.notes})`, 14, y);
        y += 6;
      });
    } else if (reportType === 'inventory') {
      doc.setFontSize(12);
      doc.text('Inventory Movement & Level Report', 14, y); y += 8;
      doc.setFontSize(9);
      products.forEach(p => {
        doc.text(`${p.sku} | ${p.name} | Stock: ${p.stock} units | Price: PHP ${p.price.toLocaleString()}`, 14, y);
        y += 6;
      });
    } else {
      doc.setFontSize(12);
      doc.text('Best Sellers & Product Velocity', 14, y); y += 8;
      doc.setFontSize(9);
      products.slice(0, 5).forEach(p => {
        doc.text(`High Velocity: ${p.name} (${p.brand}) - PHP ${p.price.toLocaleString()}`, 14, y);
        y += 6;
      });
    }

    doc.save(`Optima_Report_${reportType}_${Date.now()}.pdf`);
    showToast(`Exported ${reportType.toUpperCase()} PDF report!`, 'success');
    setActiveModal(null);
  };

  const generateExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const dateStr = new Date().toLocaleDateString();

    if (reportType === 'daily') {
      csvContent += "OPTIMA GADGETS RETAIL SYSTEM - Sales Report\r\n";
      csvContent += `Generated Date,${dateStr}\r\n\r\n`;
      csvContent += `Total Transactions,${transactions.length}\r\n`;
      csvContent += `Gross Revenue,PHP ${totalSales}\r\n`;
      csvContent += `Est. Net Profit,PHP ${totalSales * 0.25}\r\n\r\n`;
      csvContent += "Transaction No,Clerk Name,Payment Method,Total Amount,Timestamp\r\n";
      transactions.forEach(tx => {
        csvContent += `${tx.transactionNo},"${tx.clerkName}",${tx.paymentMethod},${tx.total},"${tx.timestamp}"\r\n`;
      });
    } else if (reportType === 'cash_flow') {
      csvContent += "OPTIMA GADGETS RETAIL SYSTEM - Cash Flow Report\r\n";
      csvContent += `Generated Date,${dateStr}\r\n\r\n`;
      csvContent += `Total Cash In,PHP ${cashIn}\r\n`;
      csvContent += `Total Cash Out,PHP ${cashOut}\r\n`;
      csvContent += `Net Counter Balance,PHP ${runningCash}\r\n\r\n`;
      csvContent += "Type,Category,Amount,Notes,Timestamp\r\n";
      cashLogs.forEach(c => {
        csvContent += `${c.type.toUpperCase()},"${c.category}",${c.amount},"${c.notes || ''}","${c.timestamp}"\r\n`;
      });
    } else if (reportType === 'inventory') {
      csvContent += "OPTIMA GADGETS RETAIL SYSTEM - Inventory Report\r\n";
      csvContent += `Generated Date,${dateStr}\r\n\r\n`;
      csvContent += "SKU,Product Name,Brand,Category,Price,Cost,Stock Level\r\n";
      products.forEach(p => {
        csvContent += `${p.sku},"${p.name}","${p.brand}","${p.category}",${p.price},${p.cost || 0},${p.stock}\r\n`;
      });
    } else {
      csvContent += "OPTIMA GADGETS RETAIL SYSTEM - Product Velocity & Best Sellers\r\n";
      csvContent += `Generated Date,${dateStr}\r\n\r\n`;
      csvContent += "Rank,Product Name,Brand,Stock Remaining,Price\r\n";
      products.slice(0, 10).forEach((p, idx) => {
        csvContent += `${idx + 1},"${p.name}","${p.brand}",${p.stock},${p.price}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Optima_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${reportType.toUpperCase()} Excel/CSV report!`, 'success');
    setActiveModal(null);
  };

  const handleDownload = () => {
    if (reportFormat === 'pdf') {
      generatePDF();
    } else {
      generateExcel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">One-Tap Report Generator</h3>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'daily', title: 'Sales Summary', desc: 'Revenue, orders & clerks' },
                { id: 'cash_flow', title: 'Cash Flow Log', desc: 'Cash in/out balance' },
                { id: 'inventory', title: 'Stock Movement', desc: 'Current stock vs movement' },
                { id: 'best_sellers', title: 'Best Sellers', desc: 'Product velocity analysis' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    reportType === r.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <p className="font-bold text-xs">{r.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setReportFormat('pdf')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  reportFormat === 'pdf'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">PDF Document</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Vector printable document</p>
                </div>
              </button>

              <button
                onClick={() => setReportFormat('excel')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  reportFormat === 'excel'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div>
                  <p className="font-bold text-xs">Excel / CSV</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Spreadsheet compatible format</p>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Date Range:</span>
              <span className="font-bold text-white">Today ({new Date().toLocaleDateString()})</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Format:</span>
              <span className="font-bold text-amber-400">{reportFormat === 'pdf' ? 'PDF Document' : 'Excel/CSV Spreadsheet'}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-bold transition flex items-center space-x-2 shadow-lg shadow-orange-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download {reportFormat === 'pdf' ? 'PDF' : 'Excel'} Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

