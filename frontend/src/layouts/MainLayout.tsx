import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserChatbotModal } from '../components/chat/UserChatbotModal';
import { authService } from '../services/authService';

export const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('vet_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vet_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vet_theme', 'light');
    }
  }, [isDarkMode]);

  // Session spend time heartbeat tracker: sends heartbeat every 30 seconds
  useEffect(() => {
    let secondsSpent = 0;
    const interval = setInterval(() => {
      secondsSpent += 30;
      authService.sendHeartbeat(secondsSpent);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] flex transition-colors duration-300 relative overflow-x-hidden">
      {/* Dynamic Ambient Color Glow Orbs for Glassmorphism Depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-400/25 via-sky-400/20 to-blue-500/10 blur-[110px] dark:from-cyan-500/15 dark:via-sky-600/10 dark:to-transparent opacity-80" />
        <div className="absolute -top-20 right-10 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-purple-500/20 via-indigo-500/15 to-transparent blur-[120px] dark:from-purple-600/12 dark:via-indigo-600/10 dark:to-transparent opacity-75" />
        <div className="absolute top-[40%] -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-400/18 via-teal-400/12 to-transparent blur-[130px] dark:from-emerald-500/10 dark:via-teal-600/8 dark:to-transparent opacity-70" />
        <div className="absolute -bottom-20 right-20 w-[520px] h-[520px] rounded-full bg-gradient-to-tl from-rose-400/15 via-amber-400/12 to-transparent blur-[110px] dark:from-rose-500/8 dark:via-amber-500/6 dark:to-transparent opacity-70" />
      </div>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <Header
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Direct User Query Chatbot connected directly to Administrator Desk */}
      <UserChatbotModal />
    </div>
  );
};
