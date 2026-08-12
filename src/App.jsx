import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ClerkPosView from './views/ClerkPosView';
import OwnerDashboardView from './views/OwnerDashboardView';
import ReceiptModal from './components/ReceiptModal';
import StockLogModal from './components/StockLogModal';
import CashLogModal from './components/CashLogModal';
import ReportModal from './components/ReportModal';
import AuthModal from './components/AuthModal';
import InstallAppModal from './components/InstallAppModal';
import { CheckCircle2, AlertCircle, Smartphone, ShoppingBag, TrendingUp, LogIn, UserPlus, Download } from 'lucide-react';

/* ─── Login Splash Screen (shown when not logged in) ─── */
function LoginSplash() {
  const { openAuthModal, promptInstallPWA } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 mb-5">
            <Smartphone className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">OPTIMA GADGETS</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Phones, Accessories & Repairs</p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
            POS System v2.6
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs font-bold text-slate-200">Counter Staff</p>
            <p className="text-[11px] text-slate-500 leading-tight font-medium">POS sales & transactions</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs font-bold text-slate-200">Store Owner</p>
            <p className="text-[11px] text-slate-500 leading-tight font-medium">Dashboard & analytics</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Log In to Your Account</span>
          </button>

          <button
            onClick={() => openAuthModal('signup')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/20 hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New Account</span>
          </button>

          {/* Install App */}
          <button
            onClick={promptInstallPWA}
            className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Install App on This Device</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Sign in or create your custom owner & staff accounts.
        </p>
      </div>
    </div>
  );
}

/* ─── Main Content ─── */
function MainContent() {
  const { activeRole, activeModal, notification, isLoggedIn } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
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

      {/* If not logged in — show splash/login screen */}
      {!isLoggedIn ? (
        <>
          {activeModal === 'auth' && <AuthModal />}
          {activeModal === 'install' && <InstallAppModal />}
          <LoginSplash />
        </>
      ) : (
        <>
          <Navbar />
          <main className="flex-1">
            {activeRole === 'clerk' && <ClerkPosView />}
            {activeRole === 'owner' && <OwnerDashboardView />}
          </main>
          {activeModal === 'receipt' && <ReceiptModal />}
          {activeModal === 'stock' && <StockLogModal />}
          {activeModal === 'cash' && <CashLogModal />}
          {activeModal === 'report' && <ReportModal />}
          {activeModal === 'install' && <InstallAppModal />}
        </>
      )}
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
