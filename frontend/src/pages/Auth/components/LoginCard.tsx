import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/common/Toast';
import { soundEffects } from '../utils/soundEffects';
import { RegisterModal } from './RegisterModal';

interface LoginCardProps {
  onPasswordFocusChange?: (focused: boolean) => void;
  onLoginStatusChange?: (status: 'idle' | 'loading' | 'success' | 'error') => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onPasswordFocusChange,
  onLoginStatusChange,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your email or username');
      soundEffects.playErrorSound();
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      soundEffects.playErrorSound();
      return;
    }

    setIsLoading(true);
    if (onLoginStatusChange) onLoginStatusChange('loading');

    try {
      await login({ username, password });
      if (onLoginStatusChange) onLoginStatusChange('success');
      soundEffects.playSuccessSound();
      toast.success('Welcome to Zenve DA Centre! Session authorized.');

      const isAdmin = username.toLowerCase().includes('admin') || username.toLowerCase() === 'dacentreadmin@gmail.com';

      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      if (onLoginStatusChange) onLoginStatusChange('error');
      soundEffects.playErrorSound();
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      toast.error(msg);

      setTimeout(() => {
        if (onLoginStatusChange) onLoginStatusChange('idle');
      }, 3000);
    }
  };


  return (
    <>
      <div className="w-full max-w-[430px] mx-auto rounded-[28px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-cyan-500/25 shadow-2xl shadow-slate-950/20 p-6 sm:p-7 flex flex-col justify-between relative z-10 transition-all duration-300">
        <div>
          {/* Card Header: Paw Badge & AUTHORIZED PORTAL */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950/60 backdrop-blur-md border border-amber-400/40 p-0.5 flex items-center justify-center shadow-md shadow-amber-500/15 shrink-0">
              <img
                src="/assets/zenve_logo.png"
                alt="Zenve Logo"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/20 dark:border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authorized Portal</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-3 mb-4 leading-tight">
            Sign In to <span className="bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">DA Centre</span>
          </h2>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 dark:bg-rose-950/60 backdrop-blur-md border border-rose-400/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2 animate-fade-in shadow-xs">
              <Info className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email / Username Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter email or username"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => onPasswordFocusChange?.(true)}
                  onBlur={() => onPasswordFocusChange?.(false)}
                  placeholder="Enter password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    soundEffects.playClick();
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep signed in & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Keep me signed in
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  toast.info('Contact administrator at dacentreadmin@gmail.com for credential assistance.');
                }}
                className="font-semibold text-sky-600 dark:text-cyan-400 hover:text-sky-700 dark:hover:text-cyan-300 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Gradient Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#10b981] hover:brightness-105 active:scale-[0.99] transition-all shadow-lg shadow-sky-500/25 hover:shadow-cyan-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In to DA Centre</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Create Account & Divider */}
        <div>
          {/* Divider: OR */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-700/60" />
            </div>
            <div className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-full">
              NEW TO DA CENTRE?
            </div>
          </div>

          {/* Register Button */}
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-teal-700 dark:text-cyan-300 bg-teal-500/10 hover:bg-teal-500/20 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 border border-teal-500/30 dark:border-cyan-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account (Requires Admin Approval)</span>
          </button>

          {/* Bottom SSL & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3">
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
              <span>TLS 256-bit Protection</span>
            </div>
            <span className="font-bold text-[11px] text-teal-700 dark:text-cyan-400">
              Zenve DA Centre
            </span>
          </div>
        </div>
      </div>

      {/* Registration Modal with Admin Approval Flow */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
};
