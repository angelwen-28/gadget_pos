import React, { useState } from 'react';
import MobileAppFrame from '../components/MobileAppFrame';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Lock, 
  Mail,
  LogIn, 
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function MobileAuthScreen({ targetRole = 'clerk' }) {
  const { loginUser } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    const success = await loginUser(email.trim(), password);
    if (!success) {
      setErrorMsg('Invalid email or password!');
    }
  };

  return (
    <MobileAppFrame 
      statusLabel={targetRole === 'owner' ? "Owner Mobile App — Security Gate" : "Counter POS Terminal — Clerk Gate"}
      statusColor={targetRole === 'owner' ? "amber" : "cyan"}
    >
      <div className="flex-1 flex flex-col justify-between p-5 bg-slate-950 text-slate-100 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="text-center pt-2 pb-4 space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">OPTIMA GADGETS</h1>
            <p className="text-xs text-slate-400 font-medium">
              {targetRole === 'owner' ? 'Owner Monitoring App' : 'On-Site Counter POS Terminal'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 my-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. staff@mygadgetshop.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-9 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition flex items-center justify-center space-x-2"
          >
            <span>Authenticate & Enter App</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-[10px] text-slate-600 text-center pt-2 border-t border-slate-900">
          Role-based access: Clerks enter POS Counter. Owners enter Live Dashboard.
        </p>

      </div>
    </MobileAppFrame>
  );
}
