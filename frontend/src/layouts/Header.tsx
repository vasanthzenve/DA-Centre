import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Plus, Sparkles, User, Bell, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Compute breadcrumbs from location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'Dashboard', path: '/' }];
    if (path === '/market-research')
      return [
        { label: 'Planning & Market Research', path: '/market-research' },
        { label: 'Research Companies', path: '/market-research' },
      ];
    if (path === '/veterinary-ecosystem')
      return [
        { label: 'Veterinary Ecosystem', path: '/veterinary-ecosystem' },
        { label: 'Hospitals & Clinics', path: '/veterinary-ecosystem' },
      ];
    if (path.startsWith('/marketplace')) {
      const sub = path.split('/')[2];
      const subLabel = sub ? sub.charAt(0).toUpperCase() + sub.slice(1) : 'Catalog';
      return [
        { label: 'Marketplace', path: '/marketplace/hygiene' },
        { label: subLabel, path },
      ];
    }
    if (path === '/service-network')
      return [
        { label: 'Service Network', path: '/service-network' },
        { label: 'Providers', path: '/service-network' },
      ];
    if (path === '/doctors')
      return [
        { label: 'Doctor Directory', path: '/doctors' },
        { label: 'Specialists', path: '/doctors' },
      ];
    if (path === '/welfare-network')
      return [
        { label: 'Welfare Network', path: '/welfare-network' },
        { label: 'Organizations', path: '/welfare-network' },
      ];
    if (path === '/excel-management')
      return [
        { label: 'Operations', path: '/excel-management' },
        { label: 'Excel Import / Export Hub', path: '/excel-management' },
      ];
    if (path === '/reports')
      return [{ label: 'Reports & Business Intelligence', path: '/reports' }];
    return [{ label: 'Overview', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl border-b border-white/60 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-xs lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {location.pathname === '/' ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#06b6d4] via-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="13" width="3" height="7" rx="1" fill="currentColor" stroke="none" />
                <rect x="10.5" y="8" width="3" height="12" rx="1" fill="currentColor" stroke="none" />
                <rect x="17" y="4" width="3" height="16" rx="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/60 dark:border-slate-700/50 shadow-2xs">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? 'font-bold text-slate-900 dark:text-slate-100'
                      : 'hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer'
                  }
                  onClick={() => navigate(b.path)}
                >
                  {b.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Excel Center shortcut */}
        <button
          onClick={() => navigate('/excel-management')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 backdrop-blur-md transition-all shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13h8" />
            <path d="M8 17h8" />
            <path d="M10 9h1" />
          </svg>
          <span className="hidden sm:inline">Excel Center</span>
        </button>

        {/* Admin Console shortcut for administrators */}
        {(user?.role?.includes('ADMIN') || user?.email === 'dacentreadmin@gmail.com') && (
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/25 hover:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 backdrop-blur-md transition-all shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Admin Console</span>
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* User Profile Badge & Logout Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 cursor-pointer rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-all shadow-2xs"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.fullName
                  ? user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  : 'ZC'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                {user?.fullName || 'DA Centre Admin'}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-cyan-400 font-medium truncate max-w-[120px]">
                {user?.email || 'dacentreadmin@gmail.com'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl border border-white/80 dark:border-slate-700/80 shadow-2xl py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'DA Centre Administrator'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'dacentreadmin@gmail.com'}
                </div>
                <div className="mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-cyan-300 border border-teal-500/25">
                  Role: {user?.role || 'ADMIN'}
                </div>
              </div>

              {(user?.role?.includes('ADMIN') || user?.email === 'dacentreadmin@gmail.com') && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  <span>Admin Console</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                  navigate('/login');
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
