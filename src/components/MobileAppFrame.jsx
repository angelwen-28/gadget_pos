import React from 'react';

/**
 * Full-screen wrapper for mobile app views (Clerk POS, Owner App, Manager App).
 * Previously rendered a fake phone shell mockup — now renders content
 * directly full-screen since this IS the actual mobile PWA.
 */
export default function MobileAppFrame({ children, statusLabel, statusColor = 'cyan' }) {
  const colorMap = {
    cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30' },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  };

  const c = colorMap[statusColor] || colorMap.cyan;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Thin role status bar at the very top */}
      {statusLabel && (
        <div className={`flex items-center justify-center space-x-2 py-1.5 px-4 ${c.bg} border-b ${c.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse ${c.text}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${c.text}`}>
            {statusLabel}
          </span>
        </div>
      )}

      {/* App content fills remaining screen */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
