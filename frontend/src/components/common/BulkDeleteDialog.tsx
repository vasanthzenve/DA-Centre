import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckSquare, Layers } from 'lucide-react';
import { Modal } from './Modal';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  currentPageCount: number;
  totalElements?: number;
  moduleName: string;
  onConfirmDelete: (idsToDelete?: number[], deleteAll?: boolean) => Promise<void> | void;
  currentPageIds: number[];
  onSelectAllCurrentPage: () => void;
  onClearSelection?: () => void;
  isLoading?: boolean;
  isAllMatchingSelected?: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  isOpen,
  onClose,
  selectedCount,
  currentPageCount,
  totalElements,
  moduleName,
  onConfirmDelete,
  currentPageIds,
  onSelectAllCurrentPage,
  onClearSelection,
  isLoading = false,
  isAllMatchingSelected = false,
}) => {
  const [deleteScope, setDeleteScope] = useState<'selected' | 'all'>('selected');

  useEffect(() => {
    if (isOpen) {
      if (isAllMatchingSelected) {
        setDeleteScope('all');
      } else {
        setDeleteScope('selected');
      }
    }
  }, [isOpen, isAllMatchingSelected]);

  const isSelectionActive = selectedCount > 0;
  const hasMoreThanPage = totalElements !== undefined && totalElements > (selectedCount > 0 ? selectedCount : currentPageCount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Delete ${moduleName}`}
      maxWidth="md"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-2">
          {deleteScope === 'all' ? (
            <>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                You are about to delete <strong className="text-rose-600 dark:text-rose-400 font-bold">ALL {totalElements?.toLocaleString()}</strong> {moduleName.toLowerCase()}.
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold leading-relaxed">
                ⚠️ WARNING: This will permanently wipe all {totalElements?.toLocaleString()} records in the database across all pages. This action is irreversible!
              </p>
            </>
          ) : isSelectionActive ? (
            <>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                You have selected <strong className="text-rose-600 dark:text-rose-400 font-bold">{selectedCount}</strong> {moduleName.toLowerCase()} on this page.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete these selected records? This action cannot be undone.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                No individual rows are currently selected.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You can delete all <strong className="text-rose-600 dark:text-rose-400 font-bold">{currentPageCount}</strong> records on this page, or choose to delete all {totalElements?.toLocaleString()} records in the registry.
              </p>
            </>
          )}

          {totalElements !== undefined && totalElements > 0 && (
            <div className="pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Total in registry: {totalElements.toLocaleString()} records
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scope Selector when registry has more than 1 page */}
      {hasMoreThanPage && (
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Select Deletion Scope:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              onClick={() => setDeleteScope('selected')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                deleteScope === 'selected'
                  ? 'bg-white/95 dark:bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="deleteScope"
                value="selected"
                checked={deleteScope === 'selected'}
                onChange={() => setDeleteScope('selected')}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {selectedCount > 0 ? `Selected Only (${selectedCount})` : `Current Page (${currentPageCount})`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Only delete from the current view
                </div>
              </div>
            </label>

            <label
              onClick={() => setDeleteScope('all')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                deleteScope === 'all'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="deleteScope"
                value="all"
                checked={deleteScope === 'all'}
                onChange={() => setDeleteScope('all')}
                className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span>ALL Records ({totalElements?.toLocaleString()})</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Wipe all {totalElements?.toLocaleString()} records in registry
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {deleteScope === 'selected' && !isSelectionActive && currentPageCount > 0 && (
            <button
              type="button"
              onClick={onSelectAllCurrentPage}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Select All on Page ({currentPageCount})</span>
            </button>
          )}

          {isSelectionActive && onClearSelection && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          {deleteScope === 'all' ? (
            <button
              type="button"
              onClick={() => onConfirmDelete(undefined, true)}
              disabled={isLoading || !totalElements || totalElements === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete All {totalElements?.toLocaleString()} Records</span>
            </button>
          ) : isSelectionActive ? (
            <button
              type="button"
              onClick={() => onConfirmDelete()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Selected ({selectedCount})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmDelete(currentPageIds, false)}
              disabled={isLoading || currentPageCount === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Current Page ({currentPageCount})</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
