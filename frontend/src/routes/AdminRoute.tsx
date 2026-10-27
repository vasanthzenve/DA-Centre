import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Verifying administrative privileges...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = authService.isAdmin();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-8 shadow-2xl shadow-slate-950/60 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
              Access Restricted
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              Administrator Console Only
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              You are signed in as a standard user. The Admin Console is strictly reserved for authorized DA Centre Administrators (<strong>dacentreadmin@gmail.com</strong>).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Your Account:</span>
              <span className="font-bold text-slate-200">{authService.getCurrentUser()?.email || 'User'}</span>
            </div>
            <div className="flex justify-between">
              <span>Your Role:</span>
              <span className="font-bold text-teal-400">{authService.getCurrentUser()?.role || 'ROLE_USER'}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to DA Centre Portal</span>
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
