import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Copy, Check } from 'lucide-react';

interface DetailField {
  label: string;
  value: any;
  isUrl?: boolean;
  isPhone?: boolean;
  isMap?: boolean;
  isRating?: boolean;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-hidden">
      {/* Backdrop covering entire screen */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 pointer-events-none z-10">
        <div className="w-screen max-w-xl bg-white dark:bg-[#0A0F1D] shadow-2xl border-l border-slate-200/80 dark:border-slate-800/80 flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 sm:px-7 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-md shrink-0">
            <div className="pr-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Detailed Record
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with professional card grid padding */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {fields.map((f, idx) => {
                if (f.value === null || f.value === undefined || f.value === '') {
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80"
                    >
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                        {f.label}
                      </span>
                      <span className="text-xs italic text-slate-400 dark:text-slate-500">Not specified</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-2xs ${
                      String(f.value).length > 60 || f.isMap ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {f.label}
                      </span>
                      {typeof f.value === 'string' && (
                        <button
                          onClick={() => copyToClipboard(String(f.value), f.label)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copiedKey === f.label ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Rendering based on type */}
                    {f.isUrl ? (
                      <a
                        href={f.value.startsWith('http') ? f.value : `https://${f.value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline break-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        {f.value}
                      </a>
                    ) : f.isPhone ? (
                      <a
                        href={`tel:${f.value}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {f.value}
                      </a>
                    ) : f.isMap ? (
                      <a
                        href={f.value.startsWith('http') ? f.value : `https://maps.google.com/?q=${encodeURIComponent(f.value)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline break-all"
                      >
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        Open in Google Maps
                      </a>
                    ) : f.isRating ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {f.value}
                        </span>
                        <span className="text-xs text-slate-400">/ 5.0</span>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-pre-line leading-relaxed">
                        {String(f.value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-7 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
