import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, RefreshCw, X, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ExcelPreviewResponse, JobInfo } from '../../types';
import { useToast } from '../common/Toast';
import { jobService } from '../../services/jobService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  moduleKey?: string;
  onPreview: (file: File) => Promise<ExcelPreviewResponse>;
  onConfirm: (validRows: Record<string, any>[]) => Promise<number>;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  moduleKey,
  onPreview,
  onConfirm,
  onSuccess,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid');

  // Background Async Job tracking
  const [activeJob, setActiveJob] = useState<JobInfo | null>(null);
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
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
            setIsImporting(false);
            toast.success(`Import completed successfully! ${updated.successRows.toLocaleString()} rows added.`);
            onSuccess();
          } else if (updated.status === 'FAILED') {
            clearInterval(pollIntervalRef.current);
            setIsImporting(false);
            toast.error(updated.message || 'Import job failed');
          }
        } catch (e) {
          console.error('Job polling error', e);
        }
      }, 1500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [activeJob?.jobId, activeJob?.status, onSuccess, toast]);

  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setSelectedFile(null);
    setPreviewData(null);
    setActiveJob(null);
    setIsUploading(false);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please upload an .xlsx Excel spreadsheet');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    try {
      const preview = await onPreview(file);
      setPreviewData(preview);
      if (preview.validCount > 0) {
        setActiveTab('valid');
      } else {
        setActiveTab('invalid');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to parse Excel file');
      handleReset();
    } finally {
      setIsUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.validCount === 0) return;

    // When selectedFile is available, always stream the full file via startAsyncImport
    // to ensure 100% of all rows (unlimited datas, no 500-row limit) are inserted!
    if (selectedFile) {
      await handleStartAsyncImport();
      return;
    }

    setIsImporting(true);
    try {
      const count = await onConfirm(previewData.previewRows);
      toast.success(`Successfully imported ${count} records into ${moduleName}`);
      onSuccess();
      handleReset();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to import records');
    } finally {
      setIsImporting(false);
    }
  };

  const handleStartAsyncImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const target = moduleKey || moduleName;
      const job = await jobService.startAsyncImport(target, selectedFile);
      setActiveJob(job);
      toast.info(`Streaming import started for ${previewData?.validCount?.toLocaleString() || 'all'} records...`);
    } catch (err: any) {
      setIsImporting(false);
      toast.error(err.response?.data?.message || 'Failed to start streaming import');
    }
  };

  const previewHeaders = React.useMemo(() => {
    if (!previewData || !previewData.previewRows || previewData.previewRows.length === 0) return [];
    const firstRow = previewData.previewRows[0] || {};
    const firstRowKeys = Object.keys(firstRow);

    if (previewData.detectedHeaders && previewData.detectedHeaders.length > 0) {
      const matched = previewData.detectedHeaders.filter((h) => h in firstRow);
      if (matched.length > 0) return matched;
    }

    return firstRowKeys.filter((k) => {
      const hasCleanTwin = firstRowKeys.some(
        (other) =>
          other !== k &&
          other.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (hasCleanTwin && /^[a-z]/.test(k) && !k.includes(' ')) {
        return false;
      }
      return true;
    });
  }, [previewData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={`Excel Import: ${moduleName}`}
      subtitle="Upload .xlsx file, review parsed headers and validate rows before committing to database (Streaming engine enabled)"
      maxWidth="6xl"
    >
      {/* Background Async Job In Progress / Done View */}
      {activeJob ? (
        <div className="p-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeJob.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : activeJob.status === 'FAILED' ? (
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {activeJob.status === 'COMPLETED'
                      ? 'Import Completed Successfully!'
                      : activeJob.status === 'FAILED'
                      ? 'Import Job Failed'
                      : 'Streaming Batch Import In Progress...'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Job ID: {activeJob.jobId.slice(0, 12)} • High-performance batched pipeline
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
                  {activeJob.processedRows.toLocaleString()} rows processed
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

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 block">Inserted Successfully</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {activeJob.successRows.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 block">Failed / Skipped</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {activeJob.failedRows.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 block">Target Module</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {moduleName}
                </span>
              </div>
            </div>

            {activeJob.message && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {activeJob.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : !previewData ? (
        <div className="py-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx"
            className="hidden"
          />

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-850/50 transition-all group"
          >
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              {isUploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isUploading ? 'Analyzing Excel Sheets & Columns...' : 'Click to Upload .xlsx Spreadsheet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">
              The streaming reader will inspect sheet structure and validate headers against database fields with low memory footprint.
            </p>

            <span className="mt-4 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              Supports .xlsx up to 100MB (Millions of rows)
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Sheet Detected</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {previewData.sheetName || 'Sheet1'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Scanned Rows</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {previewData.totalRows.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Valid Rows</span>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {previewData.validCount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
              <span className="text-xs text-rose-600 dark:text-rose-400">Invalid / Skipped</span>
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                {previewData.invalidCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Large-file info banner */}
          {previewData.validCount > previewData.previewRows.length && (
            <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              <div>
                <span className="font-bold">Full Dataset Support:</span> Showing first{' '}
                <span className="font-semibold">{previewData.previewRows.length.toLocaleString()}</span> rows for table preview.
                Clicking <span className="font-semibold">Import All Valid Records</span> below will stream and insert{' '}
                <span className="font-bold underline">{previewData.validCount.toLocaleString()} records</span> directly into the database with zero limits.
              </div>
            </div>
          )}

          {/* Validation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'valid'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid Records ({previewData.validCount.toLocaleString()})
            </button>
            <button
              onClick={() => setActiveTab('invalid')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'invalid'
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Errors &amp; Issues ({previewData.invalidCount.toLocaleString()})
            </button>
          </div>

          {/* Table Preview */}
          <div className="max-h-[520px] overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            {activeTab === 'valid' ? (
              previewData.previewRows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No valid records found in preview</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-12">#</th>
                      {previewHeaders.map((header) => (
                        <th key={header} className="px-3 py-2 font-semibold whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {previewData.previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-1.5 text-slate-400">{idx + 1}</td>
                        {previewHeaders.map((header) => (
                          <td key={header} className="px-3 py-1.5 whitespace-nowrap truncate max-w-[200px]">
                            {String(row[header] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : previewData.invalidRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-600 dark:text-emerald-400">
                All records passed validation! No errors detected.
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {previewData.invalidRows.map((err, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300"
                  >
                    <span className="font-bold">Row {err.rowNumber}:</span> {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
            >
              Upload Different File
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCommit}
                disabled={isImporting || previewData.validCount === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Streaming Records to Database...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-emerald-200" />
                    Import All {previewData.validCount.toLocaleString()} Valid Records
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
