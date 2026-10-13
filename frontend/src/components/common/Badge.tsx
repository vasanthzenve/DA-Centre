import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const variantClasses = {
    emerald: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/35 shadow-2xs',
    cyan: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25 dark:border-cyan-500/35 shadow-2xs',
    amber: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/35 shadow-2xs',
    rose: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/35 shadow-2xs',
    indigo: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/35 shadow-2xs',
    slate: 'bg-slate-200/50 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:bg-slate-800/60 dark:border-slate-700/60 shadow-2xs',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-3 py-1 text-xs font-bold tracking-wide',
  };

  return (
    <span className={`inline-flex items-center backdrop-blur-xs rounded-full border ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};
