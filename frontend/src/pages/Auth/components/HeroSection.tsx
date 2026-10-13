import React from 'react';
import { Brain, Activity, ShieldCheck, BarChart3 } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  soundType: 'dog' | 'cat' | 'bunny' | 'parrot';
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'ai-analytics',
    icon: <Brain strokeWidth={1.8} className="w-5 h-5 text-cyan-300" />,
    title: 'AI Analytics',
    subtitle: 'Real-time insights',
    soundType: 'dog',
  },
  {
    id: 'health-trends',
    icon: <Activity strokeWidth={1.8} className="w-5 h-5 text-emerald-300" />,
    title: 'Health Trends',
    subtitle: '99.99% Accuracy',
    soundType: 'cat',
  },
  {
    id: 'disease-detection',
    icon: <ShieldCheck strokeWidth={1.8} className="w-5 h-5 text-teal-300" />,
    title: 'Disease Detection',
    subtitle: 'Early Alerts',
    soundType: 'bunny',
  },
  {
    id: 'population-insights',
    icon: <BarChart3 strokeWidth={1.8} className="w-5 h-5 text-sky-300" />,
    title: 'Population Insights',
    subtitle: 'Better Decisions',
    soundType: 'parrot',
  },
];

export const HeroSection: React.FC = () => {
  const handleFeatureClick = (feature: FeatureItem) => {
    soundEffects.playPetSound(feature.soundType);
  };

  return (
    <div className="w-full flex flex-col justify-start items-start text-left select-none animate-fade-in">
      {/* Pill Badge: AI POWERED VETERINARY PLATFORM */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[11px] font-medium uppercase tracking-wider mb-3 w-fit shadow-lg shadow-cyan-950/30">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>AI Powered Veterinary Platform</span>
      </div>

      {/* Main Hero Headline (Medium Style Typography At Top) */}
      <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-medium text-white tracking-tight leading-[1.2] mb-2.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
        <span>Unified Veterinary</span>
        <br />
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-medium drop-shadow-none">
          Data Infrastructure
        </span>
        <br />
        <span>for Global Intelligence.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm lg:text-[14px] text-white/95 font-normal tracking-wide mb-5 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] flex items-center gap-2 flex-wrap">
        <span>Smarter data</span>
        <span className="text-cyan-400">•</span>
        <span>Healthier pets</span>
        <span className="text-cyan-400">•</span>
        <span>A brighter future</span>
      </p>

      {/* 4 Feature Cards (2 by 2 Layout) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 max-w-[450px] w-full">
        {FEATURE_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => handleFeatureClick(item)}
            className="group p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400/60 shadow-lg shadow-slate-950/40 hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col items-start gap-2.5"
          >
            {/* Medium Style Icon Squircle Container */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center group-hover:scale-105 group-hover:border-cyan-400 group-hover:bg-cyan-950/80 transition-all shadow-xs shrink-0">
              {item.icon}
            </div>

            {/* Medium Style Typography */}
            <div className="flex flex-col gap-0.5">
              <div className="text-xs sm:text-[13px] font-medium text-white leading-tight group-hover:text-cyan-300 transition-colors">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-300/80 font-normal leading-snug">
                {item.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
