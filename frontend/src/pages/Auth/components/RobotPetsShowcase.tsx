import React, { useState, useRef } from 'react';
import { Heart, BarChart3, Activity, Shield, Sparkles, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface RobotPetsShowcaseProps {
  isPasswordFocused: boolean;
  loginStatus: 'idle' | 'loading' | 'success' | 'error';
  isDarkMode: boolean;
}

interface PetTelemetry {
  name: string;
  species: 'dog' | 'cat' | 'bunny' | 'parrot';
  role: string;
  status: string;
  battery: string;
  description: string;
  position: string;
}

const PETS: PetTelemetry[] = [
  {
    name: 'Aero-Bunny Mk.III',
    species: 'bunny',
    role: 'Micro-Diagnostics & Rapid Reflex',
    status: 'Precision Telemetry Active',
    battery: '100% Solid-State Bio-Cell',
    description: 'High-frequency auditory and motion sensor array for clinical specimen monitoring.',
    position: 'left-[14%] bottom-[24%]',
  },
  {
    name: 'Cyber-Hound Zen-1',
    species: 'dog',
    role: 'Central Guardian & Vital Node Lead',
    status: 'Optimal Neural Link Active',
    battery: '99.8% Quantum Core',
    description: 'Autonomous patient wellness tracker with smart cyan paw telemetry collar.',
    position: 'left-[36%] bottom-[32%]',
  },
  {
    name: 'Nano-Kitten Vesper',
    species: 'cat',
    role: 'Continuous Biometric Scanner',
    status: 'Sapphire Optics Calibrated',
    battery: '100% Photonic Buffer',
    description: 'Gentle bio-wave feline companion with ultra-sensitive acoustic sensors.',
    position: 'left-[58%] bottom-[27%]',
  },
  {
    name: 'Solar-Macaw Skylar',
    species: 'parrot',
    role: 'Aerial Telemetry & Cloud Uplink',
    status: 'Satellite Link Synced (10 Gbps)',
    battery: '100% Solar-Weave Wing Cell',
    description: 'Broadcasting live hospital telemetry streams directly to the data cluster.',
    position: 'left-[78%] bottom-[32%]',
  },
];

export const RobotPetsShowcase: React.FC<RobotPetsShowcaseProps> = ({
  isPasswordFocused,
  loginStatus,
  isDarkMode,
}) => {
  const [selectedPet, setSelectedPet] = useState<PetTelemetry | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const triggerPetInteraction = (pet: PetTelemetry) => {
    setSelectedPet(pet);
    soundEffects.playPetSound(pet.species);
    setActiveReaction(`✨ ${pet.name}: ${pet.status}`);
    setTimeout(() => {
      setActiveReaction(null);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col justify-between w-full select-none"
    >
      {/* 1. Header Typography */}
      <div className="z-10 mb-2">
        {/* Minimalist Overline */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/20 dark:border-cyan-500/30 text-teal-700 dark:text-cyan-300 text-[10px] font-bold tracking-wider uppercase mb-1.5 shadow-xs">
          <span>AI VETERINARY INTELLIGENCE</span>
        </div>

        {/* Hero Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-1">
          Intelligent Care,{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Reimagined.
          </span>
        </h2>

        {/* Short & Elegant Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
          Next-generation robotic companions &amp; unified clinical data infrastructure.
        </p>
      </div>

      {/* 2. Central Realistic 3D Dais Stage */}
      <div
        className="relative w-full aspect-[16/9] max-h-[250px] sm:max-h-[280px] lg:max-h-[300px] xl:max-h-[320px] rounded-2xl overflow-hidden my-auto transition-transform duration-300 ease-out border border-white/60 dark:border-slate-800 shadow-xl shadow-cyan-900/10 dark:shadow-cyan-950/40"
        style={{
          transform: `perspective(1000px) rotateY(${mouseOffset.x}deg) rotateX(${-mouseOffset.y}deg)`,
        }}
      >
        {/* Photorealistic Render Image Layer */}
        <img
          src="/assets/realistic_robot_pets.jpg"
          alt="Realistic Cybernetic Robot Pets on Holographic Dais"
          className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.03]"
        />

        {/* Soft Radial Ambient Lighting / Hologram Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-cyan-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Hologram Rings Overlay Animation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full border border-cyan-400/40 animate-pulse-ring pointer-events-none" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full border border-teal-300/30 animate-spin-slow pointer-events-none" />

        {/* Interactive Floating Hologram Badges */}
        {/* Hologram Badge 1: Better Care / Healthier Pets */}
        <div
          onClick={() => {
            soundEffects.playHologramTone();
            setActiveReaction('💓 Telemetry Pulse: 72 BPM • Vital signs synced across 42 clinics');
          }}
          className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-cyan-300/70 dark:border-cyan-500/50 shadow-md shadow-cyan-500/20 cursor-pointer animate-float-slow hover:scale-105 transition-transform"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 text-white flex items-center justify-center shadow-xs">
            <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
              Better Care
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-none">
              Healthier Pets
            </div>
          </div>
        </div>

        {/* Hologram Badge 2: AI Analytics / Real-time Insights */}
        <div
          onClick={() => {
            soundEffects.playHologramTone();
            setActiveReaction('📊 AI Insights Engine: 15,240 active data feeds streaming');
          }}
          className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-cyan-300/70 dark:border-cyan-500/50 shadow-md shadow-cyan-500/20 cursor-pointer animate-float-reverse hover:scale-105 transition-transform"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-emerald-300">
              AI Analytics
            </div>
            <div className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-none">
              Real-time Insights
            </div>
          </div>
        </div>

        {/* Privacy Shield Mode (Activates when password input is focused) */}
        {isPasswordFocused && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center z-20 animate-fade-in transition-all">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400/60 text-amber-300 shadow-xl shadow-amber-500/20">
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Optical Privacy Active 🛡️
              </span>
            </div>
          </div>
        )}

        {/* Login State Reactions */}
        {loginStatus === 'loading' && (
          <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/90 border border-cyan-400/70 text-cyan-300 shadow-2xl shadow-cyan-500/30">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-white tracking-wide">
                Synchronizing Neural Pet Cluster &amp; Authorizing...
              </span>
            </div>
          </div>
        )}

        {loginStatus === 'success' && (
          <div className="absolute inset-0 bg-emerald-950/50 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900/95 border-2 border-emerald-400 text-emerald-300 shadow-2xl shadow-emerald-500/40 animate-scale-up">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin-slow" />
              <div>
                <div className="text-sm font-extrabold text-white">Authentication Verified!</div>
                <div className="text-xs text-emerald-300">Robots celebrating: Access Granted to Zenve Da Centre! 🎉</div>
              </div>
            </div>
          </div>
        )}

        {loginStatus === 'error' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-semibold shadow-xl shadow-rose-950/50 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Robots confused: Invalid credentials. Head shake protocol initiated!</span>
            </div>
          </div>
        )}

        {/* Interactive Clickable Hotspots for Each Robot Pet */}
        {PETS.map((pet) => (
          <button
            key={pet.species}
            onClick={() => triggerPetInteraction(pet)}
            title={`Click to interact with ${pet.name}`}
            className={`absolute ${pet.position} z-10 group cursor-pointer focus:outline-none`}
          >
            {/* Pulsing Beacon Target */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-300/80 group-hover:scale-125 group-hover:bg-cyan-400/50 transition-all shadow-lg shadow-cyan-400/30">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 group-hover:bg-white animate-ping absolute"></span>
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>

            {/* Hover Tooltip Pill */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-400/60 text-white text-[11px] whitespace-nowrap shadow-xl pointer-events-none">
              <div className="font-bold text-cyan-300">{pet.name}</div>
              <div className="text-[10px] text-slate-300">{pet.role}</div>
            </div>
          </button>
        ))}

        {/* Live Active Reaction Toast */}
        {activeReaction && !selectedPet && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-400/60 text-cyan-200 text-[11px] font-medium shadow-xl animate-fade-in z-20 whitespace-nowrap">
            {activeReaction}
          </div>
        )}

        {/* Selected Pet Telemetry Detail Overlay inside Dais */}
        {selectedPet && (
          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-400/50 flex items-center justify-between gap-3 shadow-lg z-20 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {selectedPet.species === 'dog' && '🐶'}
                {selectedPet.species === 'cat' && '🐱'}
                {selectedPet.species === 'bunny' && '🐰'}
                {selectedPet.species === 'parrot' && '🦜'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {selectedPet.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                    {selectedPet.battery}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  {selectedPet.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPet(null)}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
