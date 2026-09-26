import React, { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, Check, FileText, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExportRequest, JobInfo } from '../../types';
import { useToast } from '../common/Toast';
import { jobService } from '../../services/jobService';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onExport: (request: ExportRequest) => Promise<void>;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  totalCount,
  filteredCount,
  selectedCount,
  onExport,
}) => {
  const toast = useToast();
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('csv');
  const [isAsyncMode, setIsAsyncMode] = useState(totalCount > 20000);
  const [isExporting, setIsExporting] = useState(false);

  // Background Job tracking
  const [activeJob, setActiveJob] = useState<JobInfo | null>(null);
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setActiveJob(null);
      setIsExporting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'RUNNING')) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const updated = await jobService.getJobStatus(activeJob.jobId);
          setActiveJob(updated);
          if (updated.status === 'COMPLETED') {
            clearInterval(pollIntervalRef.current);
            setIsExporting(false);
            toast.success(`Export job completed! ${updated.processedRows.toLocaleString()} rows generated.`);
          } else if (updated.status === 'FAILED') {
            clearInterval(pollIntervalRef.current);
            setIsExporting(false);
            toast.error(updated.message || 'Export job failed');
          }
        } catch (e) {
          console.error('Job polling error', e);
        }
      }, 1500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [activeJob?.jobId, activeJob?.status, toast]);

  const handleExport = async () => {
    setIsExporting(true);

    if (isAsyncMode) {
      try {
        const job = await jobService.startAsyncExport(moduleName, { scope, format }, format);
        setActiveJob(job);
        toast.info(`Async export queued (Job #${job.jobId.slice(0, 8)}). Processing in background...`);
      } catch (err: any) {
        setIsExporting(false);
        toast.error(err.response?.data?.message || 'Failed to start background export job');
      }
    } else {
      try {
        await onExport({ scope, format });
        toast.success(`${moduleName} exported successfully!`);
        onClose();
      } catch (err: any) {
        toast.error('Failed to export file');
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleDownloadCompletedJob = async () => {
    if (!activeJob) return;
    try {
      await jobService.downloadFile(activeJob.jobId, activeJob.fileName);
      toast.success('Download started');
    } catch (e) {
      toast.error('Failed to download exported file');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Export Data: ${moduleName}`}
      subtitle="Export records via ultra-fast streaming CSV or formatted XLSX workbook (optimized for 1.5 Crore records)"
      maxWidth="lg"
    >
      <div className="space-y-4 py-2">
        {/* Active Job Progress View */}
        {activeJob ? (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {activeJob.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : activeJob.status === 'FAILED' ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-cyan-500 animate-spin" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {activeJob.status === 'COMPLETED'
                      ? 'Export Completed!'
                      : activeJob.status === 'FAILED'
                      ? 'Export Failed'
                      : 'Background Export in Progress...'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Job ID: {activeJob.jobId.slice(0, 12)} • Format: {activeJob.format.toUpperCase()}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  activeJob.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : activeJob.status === 'FAILED'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                }`}
              >
                {activeJob.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {activeJob.processedRows.toLocaleString()} rows exported
                  {activeJob.totalRows > 0 ? ` of ${activeJob.totalRows.toLocaleString()}` : ''}
                </span>
                <span className="font-semibold">{Math.round(activeJob.progressPercent || 0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, activeJob.progressPercent || 0)}%` }}
                />
              </div>
            </div>

            {activeJob.message && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {activeJob.message}
              </p>
            )}

            {/* Completion Download Button */}
            {activeJob.status === 'COMPLETED' && (
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={handleDownloadCompletedJob}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download {activeJob.fileName || 'Export File'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Format Selection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Choose Format
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    format === 'csv'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">CSV (Streaming)</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                        15M Optimized
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Lowest memory footprint, fastest generation for massive datasets
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('xlsx')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    format === 'xlsx'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Excel (.xlsx)</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      SXSSF streaming workbook with styled business headers
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Scope Selection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Choose Export Scope
              </p>
              <div className="space-y-2">
                {/* Option 1: All */}
                <label
                  onClick={() => setScope('all')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    scope === 'all'
                      ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Export All Records</span>
                      <span className="text-xs text-slate-400">Entire dataset across database</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {totalCount.toLocaleString()} rows
                  </span>
                </label>

                {/* Option 2: Filtered */}
                <label
                  onClick={() => setScope('filtered')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    scope === 'filtered'
                      ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Export Filtered Results</span>
                      <span className="text-xs text-slate-400">Records matching search and active filters</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {filteredCount.toLocaleString()} rows
                  </span>
                </label>

                {/* Option 3: Selected */}
                <label
                  onClick={() => selectedCount > 0 && setScope('selected')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedCount === 0
                      ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                      : scope === 'selected'
                      ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200 cursor-pointer'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">Export Selected Rows</span>
                      <span className="text-xs text-slate-400">
                        {selectedCount > 0
                          ? `Only the ${selectedCount} rows currently selected`
                          : 'Select rows in table using checkboxes to enable'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {selectedCount.toLocaleString()} rows
                  </span>
                </label>
              </div>
            </div>

            {/* Background Async Mode Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAsyncMode}
                  onChange={(e) => setIsAsyncMode(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Run As Asynchronous Background Job
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Streams data in background without blocking UI or hitting HTTP timeout limits. Highly recommended for datasets &gt; 25,000 rows.
                  </span>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            {activeJob?.status === 'COMPLETED' ? 'Close' : 'Cancel'}
          </button>
          {!activeJob && (
            <button
              onClick={handleExport}
              disabled={isExporting || (scope === 'selected' && selectedCount === 0)}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Starting Export...' : `Export .${format}`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
