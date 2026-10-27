import React, { useState } from 'react';
import { AlertTriangle, Send, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { authService } from '../../services/authService';
import { dataDeletionService } from '../../services/dataDeletionService';
import { useToast } from './Toast';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
  dataType?: string;
  dataId?: number;
  dataTitle?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
  dataType,
  dataId,
  dataTitle,
}) => {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [isSubmittingToAdmin, setIsSubmittingToAdmin] = useState(false);
  const [submittedToAdmin, setSubmittedToAdmin] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAdmin = authService.isAdmin();
  const currentUser = authService.getCurrentUser();

  const inferredType =
    dataType ||
    (title.toLowerCase().includes('doctor')
      ? 'Doctor'
      : title.toLowerCase().includes('food')
      ? 'FoodProduct'
      : title.toLowerCase().includes('hygiene')
      ? 'HygieneProduct'
      : title.toLowerCase().includes('accessor')
      ? 'Accessory'
      : title.toLowerCase().includes('research')
      ? 'MarketResearch'
      : title.toLowerCase().includes('ecosystem') || title.toLowerCase().includes('hospital')
      ? 'VeterinaryEcosystem'
      : title.toLowerCase().includes('service')
      ? 'ServiceNetwork'
      : title.toLowerCase().includes('welfare')
      ? 'WelfareNetwork'
      : 'Record');

  const handleSendToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!reason.trim()) {
      setValidationError('Please enter a reason for deleting this data before sending to Admin.');
      return;
    }

    setIsSubmittingToAdmin(true);
    try {
      await dataDeletionService.submitRequest({
        dataType: inferredType,
        dataId: dataId || Math.floor(Math.random() * 1000) + 1,
        dataTitle: dataTitle || message || `${inferredType} Record`,
        reason: reason.trim(),
        userEmail: currentUser?.email || 'user@dacentre.com',
        userName: currentUser?.fullName || currentUser?.username || 'DA Centre User',
        userId: currentUser?.id,
        userCustomId: currentUser?.customUserId,
      });

      setSubmittedToAdmin(true);
      toast.success('Deletion request sent to Admin! It will be automatically deleted upon approval.');

      setTimeout(() => {
        setSubmittedToAdmin(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch deletion request to Admin');
    } finally {
      setIsSubmittingToAdmin(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      {submittedToAdmin ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Request Dispatched to Administrator!
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
            Your deletion request and reason have been sent to <strong>dacentreadmin@gmail.com</strong>. The data will automatically be purged once approved in the Admin Console.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl text-rose-600 dark:text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {message}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase">
                  {inferredType}
                </span>
                <span className="text-[11px] text-slate-400">
                  DA Centre Controlled Data
                </span>
              </div>
            </div>
          </div>

          {/* Reason Input Box */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Reason for Deletion <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Put reason for deleting this data (required for Administrator authorization)..."
              disabled={isSubmittingToAdmin || isLoading}
              className="w-full rounded-xl p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all shadow-inner"
            />
            {validationError && (
              <p className="text-[11px] text-rose-500 font-semibold">{validationError}</p>
            )}
          </div>

          {/* Policy Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Admin Approval Policy:</strong> Deletion requests require a reason and administrator authorization. Once approved by Admin, the data is automatically deleted in DA Centre.
            </span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              disabled={isSubmittingToAdmin || isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            {/* Send to Admin Button (Mandatory for Users & Available to Admin) */}
            <button
              onClick={handleSendToAdmin}
              disabled={isSubmittingToAdmin || isLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 hover:brightness-105 rounded-xl shadow-md shadow-teal-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingToAdmin ? (
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

            {/* Direct Admin Delete option if authenticated as Admin */}
            {isAdmin && (
              <button
                onClick={onConfirm}
                disabled={isSubmittingToAdmin || isLoading}
                className="px-3.5 py-2 text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Immediate purge as authorized Admin"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>Direct Admin Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
