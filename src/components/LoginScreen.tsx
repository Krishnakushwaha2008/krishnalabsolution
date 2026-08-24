import React, { useState } from 'react';
import { KLSLogo } from './KLSLogo';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { Shield, Lock, Mail, Key, UserCheck, AlertTriangle, Eye, EyeOff, Info, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@krishnalabs.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillPreset = (role: 'ADMIN' | 'OFFICER') => {
    if (role === 'ADMIN') {
      setEmail('admin@krishnalabs.com');
      setPassword('admin123');
    } else {
      setEmail('officer.sharma@krishnalabs.com');
      setPassword('officer123');
    }
    setError(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMsg(res.message);
    } catch {
      setForgotMsg('Password reset notification dispatched to SOC security terminal.');
    }
  };

  return (
    <div id="kls-login-screen" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 border-b border-slate-800 flex flex-col items-center text-center">
          <KLSLogo size="lg" showTagline={true} className="mb-2 justify-center" />
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SOC Portal &bull; Encrypted Terminal</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Officer Email / Badge ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@krishnalabs.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Security Passcode
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotEmail(email);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Forgot passcode?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[11px] text-slate-500">JWT Authenticated</span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Officer...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Enter Security Control Center</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preset Logins */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              Quick Fill Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillPreset('ADMIN')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-400">SOC Administrator</div>
                <div className="text-[10px] text-slate-500 font-mono">admin@krishnalabs.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillPreset('OFFICER')}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-sky-400">Security Officer</div>
                <div className="text-[10px] text-slate-500 font-mono">officer.sharma@...</div>
              </button>
            </div>
          </div>

          {/* System Limitation Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300/80 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Limitation Notice:</strong> Detects only objects that are visually visible in line-of-sight to cameras. Does not scan hidden items under clothing or through walls.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-center text-[11px] text-slate-500">
          KRISHNA LAB SOLUTIONS &bull; AI Weapon Detection Platform v2.4
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-slate-200">
              <Key className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm uppercase tracking-wide">SOC Passcode Recovery</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter your registered officer email to request authorization dispatch:
            </p>
            {forgotMsg ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{forgotMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="officer@krishnalabs.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Send Reset Request
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setForgotModalOpen(false);
                setForgotMsg(null);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
