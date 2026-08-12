import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Monitor, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function InstallAppModal() {
  const { setActiveModal, promptInstallPWA, canInstallPWA } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl shadow-cyan-950/50">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800/80">
          <button 
            onClick={() => setActiveModal(null)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white tracking-tight">Install Mobile POS App</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Install directly to your device home screen — works offline!</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {canInstallPWA && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">One-Tap Direct Installation</p>
                <p className="text-[11px] text-emerald-400/80">Your browser supports instant background installation.</p>
              </div>
              <button
                onClick={() => {
                  promptInstallPWA();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>How to Install on Mobile & Desktop</span>
            </h4>

            {/* iOS Safari Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] flex items-center justify-center font-mono font-bold">1</span>
                  <span>iPhone & iPad (Safari)</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">iOS</span>
              </div>
              <p className="text-xs text-slate-400 pl-7">
                Tap the <strong className="text-slate-200">Share</strong> icon <Share className="w-3.5 h-3.5 inline text-cyan-400" />, scroll down, and select <strong className="text-slate-200">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />.
              </p>
            </div>

            {/* Android Chrome Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] flex items-center justify-center font-mono font-bold">2</span>
                  <span>Android (Chrome / Edge)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">Android</span>
              </div>
              <p className="text-xs text-slate-400 pl-7">
                Tap the <strong className="text-slate-200">Three Dots ⋮</strong> menu in top-right corner, then tap <strong className="text-slate-200">"Install app"</strong> or <strong className="text-slate-200">"Add to Home Screen"</strong>.
              </p>
            </div>

            {/* Desktop Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] flex items-center justify-center font-mono font-bold">3</span>
                  <span>Desktop PC / Laptop (Chrome / Edge)</span>
                </span>
                <Monitor className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 pl-7">
                Click the <strong className="text-slate-200">Install icon</strong> in your browser address bar or use the Install button in the POS top menu.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              Got it, Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
