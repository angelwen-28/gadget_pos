import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  ShoppingBag, 
  Shield, 
  Wifi, 
  WifiOff, 
  User,
  Download,
  LogIn,
  LogOut,
  Store
} from 'lucide-react';

export default function Navbar() {
  const { 
    activeRole, 
    switchRole, 
    currentUser, 
    isLoggedIn, 
    logoutUser, 
    openAuthModal, 
    promptInstallPWA, 
    canInstallPWA,
    isOnline, 
    cart 
  } = useApp();

  // Detect if already running as installed PWA (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Store Branding */}
          <button 
            onClick={() => switchRole('storefront')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                  OPTIMA GADGETS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  POS v2.6
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Phones, Accessories & Repairs</p>
            </div>
          </button>

          {/* Navigation Bar — only shown when logged in */}
          {isLoggedIn && (
            <nav className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {/* Storefront Tab */}
              <button
                onClick={() => switchRole('storefront')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeRole === 'storefront'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Storefront</span>
              </button>

              {/* Counter POS */}
              {(currentUser?.role === 'clerk' || currentUser?.role === 'manager' || currentUser?.role === 'owner') && (
                <button
                  onClick={() => switchRole('clerk')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                    activeRole === 'clerk'
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Counter POS</span>
                  {cart.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-500 text-slate-950 rounded-full font-bold">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-2.5">
            {/* Install App Button — only show if not already installed and browser supports it */}
            {!isStandalone && canInstallPWA && (
              <button
                onClick={promptInstallPWA}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all shadow-sm"
                title="Install Mobile App on device"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="hidden md:inline">Install App</span>
              </button>
            )}

            {/* User Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 pl-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentUser.role === 'owner' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {currentUser.role === 'owner' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} Mode</p>
                  </div>
                </div>

                <button
                  onClick={logoutUser}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold shadow-md shadow-cyan-600/30 flex items-center space-x-1.5 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
