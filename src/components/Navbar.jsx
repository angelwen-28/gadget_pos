import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  Shield, 
  Wifi, 
  WifiOff, 
  UserCheck,
  User,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { activeRole, switchRole, currentUser, isOnline, cart } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Store Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => switchRole('public')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-bold">
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
          </div>

          {/* Role Navigation Switcher - One Unified App Concept */}
          <nav className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => switchRole('public')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeRole === 'public'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              onClick={() => switchRole('clerk')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                activeRole === 'clerk'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Counter POS</span>
              {cart.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-500 text-slate-950 rounded-full font-bold">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => switchRole('owner')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeRole === 'owner'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Owner App</span>
            </button>
          </nav>

          {/* Right Status & User Badge */}
          <div className="flex items-center space-x-3">
            {/* Sync Status Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-mono text-[11px]">Live Sync</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-mono text-[11px]">Offline First</span>
                </>
              )}
            </div>

            {/* Current Active User Badge */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeRole === 'owner' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : activeRole === 'clerk'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {activeRole === 'owner' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{activeRole} Mode</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
