import React, { useState } from 'react';
import {
  Trash2,
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { dataDeletionService } from '../../services/dataDeletionService';
import { authService } from '../../services/authService';

interface DataDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
  dataId: number;
  dataTitle: string;
  onSuccess?: () => void;
}

export const DataDeletionModal: React.FC<DataDeletionModalProps> = ({
  isOpen,
  onClose,
  dataType,
  dataId,
  dataTitle,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUser = authService.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('A valid reason is required to submit a data deletion request to the Administrator.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dataDeletionService.submitRequest({
        dataType,
        dataId,
        dataTitle,
        reason: reason.trim(),
        userId: currentUser?.id,
        userCustomId: currentUser?.customUserId,
        userEmail: currentUser?.email || 'user@dacentre.com',
        userName: currentUser?.fullName || currentUser?.username || 'DA Centre User',
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        onClose();
        if (onSuccess) onSuccess();
      }, 2200);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit deletion request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/30 shadow-2xl shadow-slate-950/40 overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Request Data Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Requires Administrator review and authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Request Sent to Administrator!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your deletion request and reason have been dispatched to the Administrator. Once approved, the record will automatically be deleted from DA Centre.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Item Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wide uppercase">
                    {dataType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID #{dataId}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {dataTitle || `Record #${dataId}`}
                </h4>
              </div>
              <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reason Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Deletion <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why this record should be removed from DA Centre (e.g., duplicated entry, outdated clinical data, user requested purge)..."
                disabled={isSubmitting}
                className="w-full rounded-2xl p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all shadow-inner"
              />
              <p className="text-[11px] text-slate-400">
                Provide a clear justification to help the administrator verify and approve the removal.
              </p>
            </div>

            {/* Policy Notice */}
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Automatic System Execution:</strong> Upon Administrator approval, the record will be automatically permanently deleted from the database.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending to Admin...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Admin for Approval</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
