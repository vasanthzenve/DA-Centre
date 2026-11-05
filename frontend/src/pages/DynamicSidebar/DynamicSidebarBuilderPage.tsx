import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Trash2,
  ExternalLink,
  Download,
  Table,
  Plus,
  HelpCircle,
  FileText,
  Clock,
  Database,
  Hash,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';
import { dynamicSidebarService } from '../../services/dynamicSidebarService';
import { ExcelAnalysisResult, SheetAnalysis, SidebarModule } from '../../types';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const DynamicSidebarBuilderPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Active top tab
  const [activeTab, setActiveTab] = useState<'create' | 'modules'>('create');

  // Form State
  const [sidebarName, setSidebarName] = useState('');
  const [moduleSlug, setModuleSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  // File & Analysis State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ExcelAnalysisResult | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  // Editable Fields State (Sheet -> Fields map)
  const [customFields, setCustomFields] = useState<Record<number, any[]>>({});

  // Module Creation State
  const [isCreating, setIsCreating] = useState(false);

  // Existing Modules State
  const [modules, setModules] = useState<SidebarModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<SidebarModule | null>(null);
  const [moduleToReplace, setModuleToReplace] = useState<SidebarModule | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Auto slug generation from sidebarName
  useEffect(() => {
    if (isAutoSlug) {
      const generated = sidebarName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setModuleSlug(generated);
    }
  }, [sidebarName, isAutoSlug]);

  // Load existing modules
  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setIsLoadingModules(true);
    try {
      const list = await dynamicSidebarService.getAllModules();
      setModules(list);
    } catch (err: any) {
      console.error('Failed to load modules:', err);
    } finally {
      setIsLoadingModules(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls' && ext !== '.csv') {
      toast.error('Invalid format! Please upload an .xlsx, .xls, or .csv spreadsheet.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds the 100MB limit.');
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);

    // Auto populate sidebar name if empty
    if (!sidebarName.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      const formatted = baseName
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setSidebarName(formatted);
    }

    // Auto start analysis
    startAnalysis(file);
  };

  const startAnalysis = async (fileToAnalyze?: File) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) {
      toast.error('Please select an Excel or CSV file first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(20);

    const progressTimer = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const result = await dynamicSidebarService.analyzeFile(file);
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      setSelectedSheetIndex(0);

      // Initialize customFields map
      const initialMap: Record<number, any[]> = {};
      result.sheets.forEach((sheet, idx) => {
        initialMap[idx] = sheet.fields.map((f: any) => {
          const label = f.fieldLabel || f.headerName || f.fieldName || ('Column_' + ((f.columnPosition ?? 0) + 1));
          return {
            fieldName: f.fieldName || label.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            fieldLabel: label,
            headerName: label,
            dataType: f.dataType || 'String',
            columnPosition: f.columnPosition ?? 0,
            sampleValues: f.sampleValues || [],
            isSearchable: true,
            isFilterable: true,
          };
        });
      });
      setCustomFields(initialMap);

      toast.success(`Spreadsheet analyzed! Extracted ${result.totalColumns} fields across ${result.totalSheets} sheet(s).`);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error('Analysis failed:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze spreadsheet structure.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFieldTypeChange = (sheetIdx: number, fieldIdx: number, newType: string) => {
    setCustomFields((prev) => {
      const sheetFields = [...(prev[sheetIdx] || [])];
      sheetFields[fieldIdx] = { ...sheetFields[fieldIdx], dataType: newType };
      return { ...prev, [sheetIdx]: sheetFields };
    });
  };

  const handleFieldLabelChange = (sheetIdx: number, fieldIdx: number, newLabel: string) => {
    setCustomFields((prev) => {
      const sheetFields = [...(prev[sheetIdx] || [])];
      sheetFields[fieldIdx] = {
        ...sheetFields[fieldIdx],
        fieldLabel: newLabel,
        headerName: newLabel,
      };
      return { ...prev, [sheetIdx]: sheetFields };
    });
  };

  const handleSaveModule = async () => {
    if (!sidebarName.trim()) {
      toast.error('Please provide a valid Sidebar Name');
      return;
    }

    if (!analysisResult) {
      toast.error('Please upload and analyze an Excel file before saving.');
      return;
    }

    const currentSheetFields = customFields[selectedSheetIndex] || [];
    const activeSheetName = analysisResult.sheets[selectedSheetIndex]?.sheetName || 'Sheet1';

    setIsCreating(true);
    try {
      const payload = {
        sidebarName: sidebarName.trim(),
        moduleSlug: moduleSlug.trim() || undefined,
        description: description.trim() || undefined,
        tempToken: analysisResult.tempToken,
        selectedSheetName: activeSheetName,
        customFields: currentSheetFields.map((f) => {
          const label = f.fieldLabel || f.headerName || f.fieldName || ('Column_' + ((f.columnPosition ?? 0) + 1));
          return {
            fieldName: f.fieldName || label.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            fieldLabel: label,
            headerName: label,
            dataType: f.dataType || 'String',
            columnPosition: f.columnPosition ?? 0,
            sampleValues: f.sampleValues || [],
          };
        }),
        createdBy: 'Admin',
      };

      const created = await dynamicSidebarService.createModule(
        payload,
        analysisResult?.tempToken ? undefined : (selectedFile || undefined)
      );

      toast.success(`Dynamic Sidebar module '${created.sidebarName}' generated successfully!`);

      // Dispatch event to refresh Sidebar component
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));

      // Refresh modules list
      await loadModules();

      // Reset form
      handleReset();

      // Navigate to the newly generated dynamic table
      navigate(`/dynamic/${created.moduleSlug}`);
    } catch (err: any) {
      console.error('Failed to create module:', err);
      toast.error(err.response?.data?.message || 'Failed to create dynamic module.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setCustomFields({});
    setSidebarName('');
    setModuleSlug('');
    setDescription('');
    setIsAutoSlug(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await dynamicSidebarService.deleteModule(moduleToDelete.id);
      toast.success(`Module '${moduleToDelete.sidebarName}' deleted successfully.`);
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));
      setModuleToDelete(null);
      loadModules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete module.');
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !moduleToReplace) return;

    setIsReplacing(true);
    try {
      await dynamicSidebarService.replaceFile(moduleToReplace.id, file);
      toast.success(`Spreadsheet replaced! Data refreshed for '${moduleToReplace.sidebarName}'.`);
      setModuleToReplace(null);
      loadModules();
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to replace file.');
    } finally {
      setIsReplacing(false);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentSheet: SheetAnalysis | undefined = analysisResult?.sheets[selectedSheetIndex];
  const activeFields = customFields[selectedSheetIndex] || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Dynamic Sidebar Builder
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  No-Code Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Upload any Excel (.xlsx, .xls) or CSV sheet to automatically analyze fields, infer data types, and dynamically generate permanent sidebar modules.
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Module
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'modules'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Active Modules
            {modules.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                {modules.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: CREATE DYNAMIC MODULE                                      */}
      {/* ================================================================= */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Section 1: Module Meta Configuration */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                1
              </span>
              Module Identity &amp; Sidebar Navigation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Sidebar Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Sidebar Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sidebarName}
                  onChange={(e) => setSidebarName(e.target.value)}
                  placeholder="e.g. Employee Directory, Raw Materials, Inventory"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  This custom title appears permanently in the DA Centre left navigation.
                </p>
              </div>

              {/* URL Slug Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Route URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAutoSlug(!isAutoSlug)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    {isAutoSlug ? 'Customize Slug' : 'Auto Generate'}
                  </button>
                </div>
                <div className="flex items-center rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500">
                  <span className="px-3 text-xs text-slate-400 font-mono select-none">/dynamic/</span>
                  <input
                    type="text"
                    value={moduleSlug}
                    readOnly={isAutoSlug}
                    onChange={(e) => setModuleSlug(e.target.value)}
                    placeholder="module-slug"
                    className="w-full pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Unique route path for data browsing &amp; table view.
                </p>
              </div>

              {/* Description Input */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Internal records &amp; staff roster"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Optional subtitle shown under the sidebar title.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Drag & Drop File Upload */}
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                2
              </span>
              Upload Excel or CSV Spreadsheet
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.008]'
                  : 'border-slate-300 dark:border-slate-700/80 hover:border-blue-500/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedFile ? selectedFile.name : 'Click to Upload or Drag and Drop'}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  {selectedFile
                    ? `Selected file: ${formatFileSize(selectedFile.size)}. Ready to analyze structure.`
                    : 'Upload any spreadsheet (.xlsx, .xls, .csv). The system inspects column headers, row counts, and detects field types automatically.'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  XLSX
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  XLS
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  CSV
                </span>
                <span className="text-xs text-slate-400 ml-1">Up to 100MB</span>
              </div>

              <button
                type="button"
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Browse File
              </button>
            </div>

            {/* Upload & Analysis Progress Bar */}
            {isAnalyzing && (
              <div className="mt-5 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Spreadsheet Structure &amp; Detecting Types...
                  </span>
                  <span>{analysisProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Analysis Results, Schema Inspector, & Customizer */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* File Overview Summary Bar */}
              <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {analysisResult.fileName}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Analyzed
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Size: {formatFileSize(analysisResult.fileSizeBytes)} · Structure verified and schema extracted.
                      </p>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total Sheets</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {analysisResult.totalSheets}
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total Rows</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {analysisResult.totalRows.toLocaleString()}
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Total Columns</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {analysisResult.totalColumns}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multi-Sheet Selector Tabs */}
                {analysisResult.sheets.length > 1 && (
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
                      <Table className="w-3.5 h-3.5" /> Sheets:
                    </span>
                    {analysisResult.sheets.map((sheet, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSheetIndex(idx)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                          selectedSheetIndex === idx
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sheet.sheetName}
                        <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-white/20 text-white font-mono">
                          {sheet.totalRows} rows
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Fields & Type Customizer Table */}
              <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black">
                        3
                      </span>
                      Extracted Fields &amp; Schema Configuration ({activeFields.length} columns)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify data types, rename column labels, and check sample values extracted from the spreadsheet.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Original Header</th>
                        <th className="py-3 px-4">Display Label (Editable)</th>
                        <th className="py-3 px-4">Inferred Data Type</th>
                        <th className="py-3 px-4">Sample Extracted Values</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeFields.map((field, fIdx) => (
                        <tr
                          key={fIdx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-mono text-slate-400">
                            {field.columnPosition + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {field.fieldName}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={field.fieldLabel ?? field.headerName ?? ''}
                              onChange={(e) =>
                                handleFieldLabelChange(selectedSheetIndex, fIdx, e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={field.dataType}
                              onChange={(e) =>
                                handleFieldTypeChange(selectedSheetIndex, fIdx, e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                              <option value="String">String (Text)</option>
                              <option value="Integer">Integer (Number)</option>
                              <option value="Decimal">Decimal (Float/Currency)</option>
                              <option value="Date">Date / Timestamp</option>
                              <option value="Boolean">Boolean (Yes/No)</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {field.sampleValues && field.sampleValues.length > 0 ? (
                                field.sampleValues.slice(0, 3).map((val: string, sIdx: number) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] truncate max-w-[120px]"
                                    title={val}
                                  >
                                    {val}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No sample data</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Records Live Table Preview */}
              {currentSheet && currentSheet.sampleRecords && currentSheet.sampleRecords.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-500" />
                    Sample Records Preview (First {currentSheet.sampleRecords.length} Rows)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Demonstration of how the parsed records will render in the dynamic data management table.
                  </p>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3 text-slate-400 w-10 text-center">#</th>
                          {activeFields.map((f, i) => (
                            <th key={i} className="py-2.5 px-3">
                              {f.fieldLabel || f.headerName || f.fieldName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                        {currentSheet.sampleRecords.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2 px-3 text-center text-slate-400">{rIdx + 1}</td>
                            {activeFields.map((f, i) => (
                              <td key={i} className="py-2 px-3 text-slate-700 dark:text-slate-300">
                                {String(row[f.fieldName] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Sticky Action Bar */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Ready to Create: <span className="text-blue-400 font-extrabold">{sidebarName || 'Custom Module'}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Will generate permanent sidebar item, dynamic table route &amp; store {analysisResult.totalRows.toLocaleString()} records in database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveModule}
                    disabled={isCreating || !sidebarName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Dynamic Module...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Save &amp; Generate Dynamic Sidebar
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: ACTIVE DYNAMIC MODULES MANAGEMENT                         */}
      {/* ================================================================= */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Created Dynamic Modules ({modules.length})
              </h2>
              <p className="text-xs text-slate-400">
                All no-code modules created from uploaded spreadsheets. Modules persist in the MySQL database across application restarts.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload New Spreadsheet
            </button>
          </div>

          {isLoadingModules ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Loading saved dynamic modules...
              </p>
            </div>
          ) : modules.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Dynamic Modules Created Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Upload any Excel or CSV file in the 'Create Module' tab to automatically analyze its columns and generate a custom sidebar menu.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Start Builder Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className="p-5 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 shadow-xl shadow-slate-900/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {mod.sidebarName}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            /dynamic/{mod.moduleSlug}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {mod.status}
                      </span>
                    </div>

                    {mod.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {mod.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 mb-4 text-center">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Rows</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {mod.totalRows?.toLocaleString() ?? 0}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Columns</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {mod.totalColumns ?? 0}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Sheets</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {mod.totalSheets ?? 1}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-4">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{mod.uploadedFileName || 'spreadsheet.xlsx'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/dynamic/${mod.moduleSlug}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      Open Table
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => dynamicSidebarService.exportModule(mod.id, undefined, `${mod.moduleSlug}.xlsx`)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Export records to Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setModuleToReplace(mod);
                          replaceFileInputRef.current?.click();
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Replace spreadsheet"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setModuleToDelete(mod)}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for Replace action */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Delete Confirmation Modal */}
      {moduleToDelete && (
        <ConfirmDialog
          isOpen={!!moduleToDelete}
          onClose={() => setModuleToDelete(null)}
          onConfirm={handleDeleteModule}
          title="Delete Dynamic Module"
          message={`Are you sure you want to permanently delete the module '${moduleToDelete.sidebarName}'? All extracted fields and ${moduleToDelete.totalRows?.toLocaleString()} rows will be removed from the database and the sidebar item will be removed.`}
          confirmText="Permanently Delete"
          confirmVariant="danger"
          dataType="DynamicModule"
          dataId={moduleToDelete.id}
          dataTitle={moduleToDelete.sidebarName}
        />
      )}
    </div>
  );
};
