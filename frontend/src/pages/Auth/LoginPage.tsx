import React, { useState, useEffect } from 'react';
import { AuthHeader } from './components/AuthHeader';
import { HeroSection } from './components/HeroSection';
import { LoginCard } from './components/LoginCard';
import { soundEffects } from './utils/soundEffects';

export const LoginPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('vet_theme') === 'dark';
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vet_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vet_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEffects.setMuted(next);
      return next;
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Full Realistic Robot Pets & Doctor Laboratory Background Image (Bright, Clean & Vivid) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/zenve_login_bg_vet.jpg"
          alt="Zenve DaCentre Unified Veterinary Data Infrastructure"
          className="w-full h-full object-cover object-center filter brightness-[1.08] contrast-[1.03] saturate-[1.04]"
        />
        {/* Minimal soft top gradient for header legibility - leaves doctor, pets and lab 100% bright & clean */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar */}
      <AuthHeader
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      {/* 3. Main Viewport: Left Hero Section (At Top) + Right Login Card (Centered) */}
      <main className="relative z-20 w-full flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-18 py-2 min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Left Column: Hero Typography At Top & 2x2 Feature Cards */}
        <div className="w-full lg:max-w-lg xl:max-w-xl flex flex-col justify-start items-start self-start pt-1 lg:pt-3">
          <HeroSection />
        </div>

        {/* Right Column: Floating Glass Login Card */}
        <div className="w-full lg:max-w-[420px] xl:max-w-[440px] flex justify-center lg:justify-end mt-4 lg:mt-0 self-center">
          <LoginCard />
        </div>
      </main>

      {/* 4. Subtle Minimal Bottom Bar */}
      <div className="relative z-20 w-full px-6 sm:px-10 lg:px-14 py-2 flex items-center justify-between text-[11px] text-slate-300/80 pointer-events-none">
        <span>© 2026 Zenve DaCentre. All rights reserved.</span>
        <span className="hidden sm:inline">Veterinary Big Data Intelligence &amp; Computing Infrastructure</span>
      </div>
    </div>
  );
};
