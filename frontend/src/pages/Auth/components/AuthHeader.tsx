import React from 'react';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface AuthHeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  isDarkMode = false,
  onToggleTheme,
  isMuted = false,
  onToggleMute,
}) => {
  return (
    <header className="relative z-20 w-full px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between pointer-events-auto">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 select-none">
        {/* Official Golden ZENVE Logo */}
        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-amber-400/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/15 ring-1 ring-white/20 shrink-0">
          <img
            src="/assets/zenve_logo.png"
            alt="Zenve Logo"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-sm">
              ZENVE
            </span>
            <span className="text-base sm:text-lg font-black tracking-tight text-[#00e5ff] drop-shadow-sm">
              DACENTRE
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-200/90 font-medium tracking-normal mt-1 leading-tight drop-shadow-xs">
            Veterinary Big Data Intelligence &amp; Computing Infrastructure
          </p>
        </div>
      </div>

      {/* Right: Tagline & Utilities */}
      <div className="flex items-center gap-3 select-none">
        {/* Tagline */}
        <div className="hidden md:flex items-center gap-2.5 text-xs font-semibold text-slate-200/95 tracking-wide drop-shadow-xs">
          <span>Smarter Care</span>
          <span className="text-slate-400/80">|</span>
          <span>Healthier Pets</span>
          <span className="text-slate-400/80">|</span>
          <span>A Brighter Future</span>
        </div>

        {/* Green/Cyan Paw Icon Badge */}
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <ellipse cx="12" cy="15" rx="3.6" ry="3.2" />
            <ellipse cx="7.5" cy="9.5" rx="1.6" ry="2" transform="rotate(-15 7.5 9.5)" />
            <ellipse cx="16.5" cy="9.5" rx="1.6" ry="2" transform="rotate(15 16.5 9.5)" />
            <ellipse cx="4.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(-30 4.5 13.5)" />
            <ellipse cx="19.5" cy="13.5" rx="1.3" ry="1.7" transform="rotate(30 19.5 13.5)" />
          </svg>
        </div>

        {/* Audio Mute Toggle (if callback provided) */}
        {onToggleMute && (
          <button
            onClick={() => {
              onToggleMute();
              if (isMuted) soundEffects.playClick();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 transition-all cursor-pointer"
            title={isMuted ? 'Enable Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
          </button>
        )}

        {/* Theme Toggle (if callback provided) */}
        {onToggleTheme && (
          <button
            onClick={() => {
              onToggleTheme();
              soundEffects.playClick();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 transition-all cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-cyan-300" />}
          </button>
        )}
      </div>
    </header>
  );
};
