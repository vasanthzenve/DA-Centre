import React, { useState } from 'react';
import { BarChart3, Database, Layers, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface MetricItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  arrowBg: string;
  title: string;
  description: string;
  detailStats: string;
}

const METRICS: MetricItem[] = [
  {
    id: 'records',
    icon: <BarChart3 className="w-4 h-4 text-white" />,
    iconBg: 'bg-emerald-500 shadow-emerald-500/20',
    arrowBg: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    title: '1.5 Cr+',
    description: 'Clinical Records',
    detailStats: 'High-throughput cluster telemetry',
  },
  {
    id: 'query',
    icon: <Database className="w-4 h-4 text-white" />,
    iconBg: 'bg-blue-600 shadow-blue-500/20',
    arrowBg: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
    title: '< 30ms',
    description: 'Query Engine',
    detailStats: 'Sub-30ms distributed cache',
  },
  {
    id: 'modules',
    icon: <Layers className="w-4 h-4 text-white" />,
    iconBg: 'bg-purple-600 shadow-purple-500/20',
    arrowBg: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
    title: '8 Modules',
    description: 'Unified Registry',
    detailStats: 'Clinical, Doctors & Supply chains',
  },
  {
    id: 'security',
    icon: <ShieldCheck className="w-4 h-4 text-white" />,
    iconBg: 'bg-rose-500 shadow-rose-500/20',
    arrowBg: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
    title: 'JWT 256',
    description: 'Guarded Access',
    detailStats: 'Role-based encrypted session',
  },
];

export const MetricCards: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCardClick = (metric: MetricItem) => {
    soundEffects.playClick();
    setActiveId(activeId === metric.id ? null : metric.id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
      {METRICS.map((metric) => {
        const isExpanded = activeId === metric.id;
        return (
          <div
            key={metric.id}
            onClick={() => handleCardClick(metric)}
            className={`group relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 cursor-pointer ${
              isExpanded
                ? 'bg-white dark:bg-slate-800 ring-2 ring-teal-400 dark:ring-cyan-400 shadow-md'
                : 'bg-white/85 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-start justify-between gap-2.5">
              {/* Left: Icon & Text */}
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${metric.iconBg} transform group-hover:scale-105 transition-transform`}
                >
                  {metric.icon}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-cyan-400 transition-colors">
                    {metric.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                    {metric.description}
                  </p>
                </div>
              </div>

              {/* Right: Round Arrow Button */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${metric.arrowBg} ${
                  isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Expanded Detailed Micro-Stats */}
            {isExpanded && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-teal-700 dark:text-cyan-300 flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{metric.detailStats}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
