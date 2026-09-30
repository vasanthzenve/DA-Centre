import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Search, Plus, Sparkles, User, Bell, LogOut, ChevronDown } from 'lucide-react';
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
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {location.pathname === '/' ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#2563eb] flex items-center justify-center text-white shadow-xs">
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
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? 'font-bold text-slate-900 dark:text-slate-100'
                      : 'hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer'
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
      <div className="flex items-center gap-3">
        {/* Quick Excel Center shortcut */}
        <button
          onClick={() => navigate('/excel-management')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M8 13h8" />
            <path d="M8 17h8" />
            <path d="M10 9h1" />
          </svg>
          <span>Excel Center</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile Badge & Logout Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 cursor-pointer py-1 px-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.fullName
                ? user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'ZC'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Zenve Analyst'}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-cyan-400 font-medium truncate max-w-[120px]">
                {user?.email || 'zenvedacentre@gmail.com'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'Zenve Data Centre'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'zenvedacentre@gmail.com'}
                </div>
                <div className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-cyan-300 border border-teal-500/20">
                  Role: {user?.role || 'ADMIN'}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                  navigate('/login');
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
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
