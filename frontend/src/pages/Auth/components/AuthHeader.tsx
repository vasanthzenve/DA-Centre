import React from 'react';
import { Sun, Moon, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface AuthHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 py-1.5 sm:py-2 px-1 sm:px-2">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Logo Paw Icon */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 ring-2 ring-white/60 dark:ring-slate-700/50 transform hover:scale-105 transition-transform duration-300 shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="15" rx="4" ry="3.5" />
            <ellipse cx="7.5" cy="9.5" rx="1.8" ry="2.2" transform="rotate(-15 7.5 9.5)" />
            <ellipse cx="16.5" cy="9.5" rx="1.8" ry="2.2" transform="rotate(15 16.5 9.5)" />
            <ellipse cx="4.5" cy="13.5" rx="1.5" ry="1.9" transform="rotate(-30 4.5 13.5)" />
            <ellipse cx="19.5" cy="13.5" rx="1.5" ry="1.9" transform="rotate(30 19.5 13.5)" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none">
              ZENVE <span className="text-teal-600 dark:text-cyan-400">DACENTRE</span>
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-teal-500/10 text-teal-700 dark:bg-cyan-500/20 dark:text-cyan-300 border border-teal-500/30 dark:border-cyan-500/40">
              DATA CENTRE
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Minimal Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 dark:border-emerald-700/50 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Online</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            if (isMuted) soundEffects.playClick();
          }}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-xs cursor-pointer"
          title={isMuted ? 'Enable Audio Chimes' : 'Mute Audio'}
          aria-label="Toggle Sound Effects"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
        </button>

        {/* Light / Dark Mode Segmented Pill */}
        <div className="flex items-center p-1 rounded-full bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700">
          <button
            onClick={() => {
              if (isDarkMode) {
                onToggleTheme();
                soundEffects.playClick();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              !isDarkMode
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              if (!isDarkMode) {
                onToggleTheme();
                soundEffects.playClick();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>

        {/* Top-Right Paw Button */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25 ring-2 ring-white/80 dark:ring-slate-800">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="15" rx="3.6" ry="3.2" />
            <ellipse cx="7.5" cy="9.5" rx="1.6" ry="2" transform="rotate(-15 7.5 9.5)" />
            <ellipse cx="16.5" cy="9.5" rx="1.6" ry="2" transform="rotate(15 16.5 9.5)" />
            <ellipse cx="4.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(-30 4.5 13.5)" />
            <ellipse cx="19.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(30 19.5 13.5)" />
          </svg>
        </div>
      </div>
    </header>
  );
};
