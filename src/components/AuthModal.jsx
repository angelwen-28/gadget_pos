import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function AuthModal() {
  const { setActiveModal, authMode, setAuthMode, loginUser, signUpUser } = useApp();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  
  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPin, setSignUpPin] = useState('');
  const [signUpRole, setSignUpRole] = useState('clerk');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!pin) {
      setErrorMsg('Please enter your 4-digit PIN');
      return;
    }

    const success = await loginUser(identifier || 'clerk', pin);
    if (!success) {
      setErrorMsg('Invalid Username or PIN combination');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signUpName || !signUpUsername || !signUpPin) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (signUpPin.length < 4) {
      setErrorMsg('Security PIN must be at least 4 digits');
      return;
    }

    const success = await signUpUser({
      name: signUpName,
      username: signUpUsername,
      pin: signUpPin,
      role: signUpRole
    });

    if (!success) {
      setErrorMsg('Could not register account. Check if username is available.');
    }
  };

  const quickFillLogin = async (username, defaultPin) => {
    setIdentifier(username);
    setPin(defaultPin);
    await loginUser(username, defaultPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-cyan-950/50">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80">
          <button 
            onClick={() => setActiveModal(null)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">OPTIMA POS</h3>
              <p className="text-xs text-slate-400 font-medium">Staff Account & Device Access</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                authMode === 'login'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                authMode === 'signup'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Username or Role
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. clerk, owner, john"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 0000 or 1234)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Sign In to Mobile POS
              </button>

              {/* Quick Demo Login Preset Buttons */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Demo Access Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickFillLogin('owner', '1234')}
                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 text-left transition-all"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Owner Mode</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">PIN: 1234</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickFillLogin('clerk', '0000')}
                    className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 text-left transition-all"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Counter Clerk</span>
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">PIN: 0000</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder="e.g. maria_clerk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Role
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="clerk">Clerk (Counter)</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Store Owner</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Set Security PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={signUpPin}
                      onChange={(e) => setSignUpPin(e.target.value)}
                      placeholder="e.g. 4321"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register & Log In</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
