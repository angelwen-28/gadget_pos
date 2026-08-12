import React from 'react';

/**
 * Renders children inside a realistic mobile phone frame.
 * Used for Clerk POS and Owner App views.
 */
export default function MobileAppFrame({ children, statusLabel, statusColor = 'cyan' }) {
  const colorMap = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className="flex flex-col items-center justify-start py-6 px-4 min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
      {/* Role badge above the phone */}
      <div className={`mb-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold uppercase tracking-widest ${colorMap[statusColor]} flex items-center space-x-2`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`}></span>
        <span>{statusLabel}</span>
      </div>

      {/* Phone outer shell */}
      <div className="relative w-full max-w-[390px] rounded-[44px] bg-slate-800 p-[3px] shadow-2xl shadow-black/60 ring-1 ring-white/10">
        {/* Screen bezel */}
        <div className="relative w-full rounded-[42px] bg-slate-950 overflow-hidden" style={{ minHeight: '820px' }}>
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-3 pointer-events-none">
            <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-8 pt-12 pb-1 text-[10px] font-bold text-slate-400 pointer-events-none select-none">
            <span className="font-mono">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center space-x-1.5">
              {/* Signal bars */}
              <div className="flex items-end space-x-0.5 h-3">
                {[2, 3, 4, 3].map((h, i) => (
                  <div key={i} className={`w-1 rounded-sm ${i < 3 ? 'bg-slate-300' : 'bg-slate-600'}`} style={{ height: `${h * 3}px` }}></div>
                ))}
              </div>
              {/* Wifi */}
              <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.5 8.5C5.5 4.5 10.5 2 12 2s6.5 2.5 10.5 6.5l-1.5 1.5C17.5 6.5 14 4 12 4S6.5 6.5 3 10l-1.5-1.5zm3 3C6.5 9.5 9 8 12 8s5.5 1.5 7.5 3.5L18 13c-1.5-1.5-3.5-3-6-3s-4.5 1.5-6 3L4.5 11.5zm3 3C8.5 13 10 12 12 12s3.5 1 4.5 2.5L15 16c-.8-1-1.8-2-3-2s-2.2 1-3 2L7.5 14.5zM12 18a2 2 0 110 4 2 2 0 010-4z"/>
              </svg>
              {/* Battery */}
              <div className="flex items-center space-x-0.5">
                <div className="w-5 h-2.5 rounded-sm border border-slate-400 relative flex items-center pl-0.5">
                  <div className="w-3.5 h-1.5 bg-emerald-400 rounded-[1px]"></div>
                </div>
                <div className="w-0.5 h-1.5 bg-slate-400 rounded-r-sm"></div>
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="flex flex-col" style={{ minHeight: '740px' }}>
            {children}
          </div>

          {/* Home indicator bar */}
          <div className="flex justify-center pb-2 pt-1 pointer-events-none">
            <div className="w-32 h-1 rounded-full bg-slate-600"></div>
          </div>

        </div>
      </div>

      {/* Helper hint below phone */}
      <p className="mt-5 text-[11px] text-slate-600 text-center max-w-xs">
        This view simulates the Android APK / PWA mobile app build from the unified codebase. Switch roles via the top navbar.
      </p>
    </div>
  );
}
