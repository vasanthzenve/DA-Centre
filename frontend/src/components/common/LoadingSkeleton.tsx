import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 p-5 space-y-3 animate-pulse shadow-md">
      <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
};
