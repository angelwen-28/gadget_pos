import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Store } from 'lucide-react';

/**
 * Full-screen wrapper for mobile app views (Clerk POS, Owner App, Manager App).
 * Renders content directly full-screen since this IS the actual mobile PWA.
 * Includes a minimal top bar with role label and logout/storefront buttons.
 */
export default function MobileAppFrame({ children, statusLabel, statusColor = 'cyan' }) {
  const { logoutUser, switchRole, isLoggedIn } = useApp();

  const colorMap = {
    cyan:    { text: 'text-cyan-400',    bg: 'bg-slate-900',  border: 'border-cyan-500/20',  dot: 'bg-cyan-400' },
    amber:   { text: 'text-amber-400',   bg: 'bg-slate-900',  border: 'border-amber-500/20', dot: 'bg-amber-400' },
    emerald: { text: 'text-emerald-400', bg: 'bg-slate-900',  border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  };

  const c = colorMap[statusColor] || colorMap.cyan;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">

      {/* Minimal top bar — role label + logout */}
      <div className={`flex items-center justify-between px-4 py-2 ${c.bg} border-b ${c.border} shrink-0`}>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${c.dot}`} />
          <span className={`text-[11px] font-extrabold uppercase tracking-widest ${c.text}`}>
            {statusLabel}
          </span>
        </div>

        {isLoggedIn && (
          <div className="flex items-center space-x-1">
            {/* Go to Storefront */}
            <button
              onClick={() => switchRole('storefront')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              title="Go to Storefront"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Store</span>
            </button>

            {/* Logout */}
            <button
              onClick={logoutUser}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* App content fills ALL remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
