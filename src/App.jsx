import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import StorefrontView from './views/StorefrontView';
import ClerkPosView from './views/ClerkPosView';
import OwnerDashboardView from './views/OwnerDashboardView';
import ReceiptModal from './components/ReceiptModal';
import StockLogModal from './components/StockLogModal';
import CashLogModal from './components/CashLogModal';
import ReportModal from './components/ReportModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function MainContent() {
  const { activeRole, activeModal, notification } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-bold backdrop-blur-md ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/50'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        {activeRole === 'public' && <StorefrontView />}
        {activeRole === 'clerk' && <ClerkPosView />}
        {activeRole === 'owner' && <OwnerDashboardView />}
      </main>

      {/* Render Modals based on App state */}
      {activeModal === 'receipt' && <ReceiptModal />}
      {activeModal === 'stock' && <StockLogModal />}
      {activeModal === 'cash' && <CashLogModal />}
      {activeModal === 'report' && <ReportModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
