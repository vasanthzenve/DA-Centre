import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
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
