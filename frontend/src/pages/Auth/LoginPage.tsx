import React, { useState } from 'react';
import { LoginCard } from './components/LoginCard';

export const LoginPage: React.FC = () => {
  const [, setIsPasswordFocused] = useState<boolean>(false);
  const [, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Full Realistic Robot Pets Lab Background Image (Ultra-Sharp 4K/8K Quality) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/zenve_login_bg_4k.jpg"
          alt="Zenve DaCentre Realistic Robot Pets Laboratory 8K"
          className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.03]"
        />
        {/* Soft Vignette Overlay for focus on the login card */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/35 pointer-events-none" />
      </div>

      {/* 2. Minimal Top Left Brand Badge */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        {/* Minimal Logo Squircle */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-md border border-cyan-400/30 shadow-lg shadow-cyan-950/20">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="12" cy="15" rx="3.6" ry="3.2" />
              <ellipse cx="7.5" cy="9.5" rx="1.8" ry="2.2" transform="rotate(-15 7.5 9.5)" />
              <ellipse cx="16.5" cy="9.5" rx="1.6" ry="2" transform="rotate(15 16.5 9.5)" />
              <ellipse cx="4.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(-30 4.5 13.5)" />
              <ellipse cx="19.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(30 19.5 13.5)" />
            </svg>
          </div>
          <span className="text-xs sm:text-sm font-black tracking-tight text-white">
            ZENVE <span className="text-cyan-400">DACENTRE</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
      </header>

      {/* 3. Main Viewport: ONLY Floating Login Card */}
      <main className="relative z-20 w-full flex-1 flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:pr-16 xl:pr-24 min-h-0">
        <div className="w-full max-w-[420px] animate-fade-in">
          <LoginCard
            onPasswordFocusChange={setIsPasswordFocused}
            onLoginStatusChange={setLoginStatus}
          />
        </div>
      </main>

      {/* 4. Minimal Frosted Bottom Line */}
      <footer className="relative z-20 w-full px-6 py-3 flex items-center justify-between text-[11px] text-slate-300/80 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10">
          © 2026 Zenve DACentre
        </div>
        <div className="px-3 py-1 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center gap-1.5 font-medium text-cyan-300">
          <span>Smarter Care, Happier Pets</span>
          <span>🐾</span>
        </div>
      </footer>
    </div>
  );
};
