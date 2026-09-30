import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/common/Toast';
import { soundEffects } from '../utils/soundEffects';

interface LoginCardProps {
  onPasswordFocusChange: (focused: boolean) => void;
  onLoginStatusChange: (status: 'idle' | 'loading' | 'success' | 'error') => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onPasswordFocusChange,
  onLoginStatusChange,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  // Start with clean, empty fields so users type their own credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    onLoginStatusChange('loading');

    try {
      await login({ username, password });
      onLoginStatusChange('success');
      soundEffects.playSuccessSound();
      toast.success('Welcome to Zenve Da Centre! Synchronizing dashboard...');

      setTimeout(() => {
        navigate('/');
      }, 1100);
    } catch (err: any) {
      setIsLoading(false);
      onLoginStatusChange('error');
      soundEffects.playErrorSound();
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      toast.error(err.message || 'Login failed');

      setTimeout(() => {
        onLoginStatusChange('idle');
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto rounded-3xl glass-morphism-card p-5 sm:p-6 flex flex-col justify-between relative z-10 transition-all duration-300 overflow-hidden">
      {/* Specular Light Reflection Sheen on top-left of the glass card */}
      <div className="absolute inset-0 glass-specular-highlight pointer-events-none rounded-3xl" />

      <div className="relative z-10">
        {/* Header Titles */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <ellipse cx="12" cy="15" rx="3.6" ry="3.2" />
                <ellipse cx="7.5" cy="9.5" rx="1.6" ry="2" transform="rotate(-15 7.5 9.5)" />
                <ellipse cx="16.5" cy="9.5" rx="1.6" ry="2" transform="rotate(15 16.5 9.5)" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-md border border-white/60 dark:border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-cyan-400 animate-pulse"></span>
              <span>Authorized Portal</span>
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Sign In to <span className="bg-gradient-to-r from-teal-500 to-cyan-400 bg-clip-text text-transparent">DA Centre</span>
          </h3>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 dark:bg-rose-950/60 backdrop-blur-md border border-rose-400/40 dark:border-rose-700/60 text-rose-800 dark:text-rose-200 text-[11px] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
              <Info className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email / Username Glass Input */}
          <div className="space-y-1">
            <label
              htmlFor="username"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-cyan-300/90 drop-shadow-xs"
            >
              EMAIL ADDRESS OR USERNAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600 dark:text-cyan-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                id="username"
                name="username"
                autoComplete="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl glass-morphism-input text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Glass Input */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-cyan-300/90 drop-shadow-xs"
            >
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600 dark:text-cyan-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                id="password"
                name="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => onPasswordFocusChange(true)}
                onBlur={() => onPasswordFocusChange(false)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl glass-morphism-input text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPassword(!showPassword);
                  soundEffects.playClick();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-600 hover:text-slate-900 dark:text-cyan-400 dark:hover:text-cyan-200 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Keep signed in & Forgot password row */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-white/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200 drop-shadow-2xs">
                Keep me signed in
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                toast.info('Password reset link has been dispatched to authorized contacts.');
              }}
              className="font-semibold text-teal-700 dark:text-cyan-300 hover:underline cursor-pointer drop-shadow-2xs"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit CTA Glass Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white glass-btn-cta active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1.5"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to DA Centre</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Minimalist Security Badge with Glass Divider */}
      <div className="mt-4 pt-3 border-t border-white/30 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 font-medium relative z-10">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
          <span className="drop-shadow-2xs">🔐 Advanced SSL Protection</span>
        </div>
        <span className="text-teal-700 dark:text-cyan-400 font-semibold drop-shadow-2xs">
          DA Centre
        </span>
      </div>
    </div>
  );
};
