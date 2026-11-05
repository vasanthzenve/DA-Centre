import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Check,
  Copy,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  X,
  Settings,
} from 'lucide-react';
import { dynamicSidebarService } from '../../services/dynamicSidebarService';
import { SidebarModule, SidebarField, PageResponse } from '../../types';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';

export const DynamicModulePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Module state
  const [module, setModule] = useState<SidebarModule | null>(null);
  const [fields, setFields] = useState<SidebarField[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('Sheet1');
  const [isLoadingModule, setIsLoadingModule] = useState(true);

  // Records state
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<any>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Query state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selection & bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [showDeleteModuleConfirm, setShowDeleteModuleConfirm] = useState(false);

  // Detail drawer
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

  // Replace file state
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load module metadata & schema
  useEffect(() => {
    if (!slug) return;
    loadModuleData(slug);
  }, [slug]);

  const loadModuleData = async (moduleSlug: string) => {
    setIsLoadingModule(true);
    try {
      const mod = await dynamicSidebarService.getModuleBySlug(moduleSlug);
      setModule(mod);

      const defaultSheet =
        mod.sheetNames && mod.sheetNames.length > 0 ? mod.sheetNames[0] : 'Sheet1';
      setActiveSheet(defaultSheet);

      // Load fields for default sheet
      const fList = await dynamicSidebarService.getModuleFields(mod.id, defaultSheet);
      setFields(fList);
    } catch (err: any) {
      console.error('Failed to load dynamic module:', err);
      toast.error('Module not found or inaccessible.');
    } finally {
      setIsLoadingModule(false);
    }
  };

  // Load records whenever query / pagination / sheet changes
  useEffect(() => {
    if (!module) return;
    fetchRecords();
  }, [module?.id, activeSheet, debouncedSearch, currentPage, pageSize, sortField, sortDir]);

  const fetchRecords = async () => {
    if (!module) return;
    setIsLoadingRecords(true);
    try {
      const resp = await dynamicSidebarService.getModuleRecords(module.id, {
        sheetName: activeSheet,
        search: debouncedSearch || undefined,
        page: currentPage,
        size: pageSize,
        sortField,
        sortDir,
      });

      setRecords(resp.content || []);
      setPageInfo(resp);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to fetch module records:', err);
      toast.error('Failed to load table records.');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Handle sheet tab change
  const handleSheetChange = async (sheetName: string) => {
    if (!module || activeSheet === sheetName) return;
    setActiveSheet(sheetName);
    setCurrentPage(0);
    try {
      const fList = await dynamicSidebarService.getModuleFields(module.id, sheetName);
      setFields(fList);
    } catch (err) {
      console.error('Failed to load fields for sheet:', sheetName);
    }
  };

  // Sorting
  const handleSort = (fieldKey: string) => {
    if (sortField === fieldKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(fieldKey);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  // Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = records.map((r) => r.id).filter(Boolean);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!module || selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await dynamicSidebarService.deleteRecords(module.id, selectedIds);
      toast.success(`${selectedIds.length} records deleted successfully.`);
      setShowBulkDeleteConfirm(false);
      setSelectedIds([]);
      fetchRecords();
      // Update module record count locally
      setModule((prev) =>
        prev ? { ...prev, totalRows: Math.max(0, (prev.totalRows || 0) - selectedIds.length) } : prev
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete records.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Single Record Delete
  const handleSingleDelete = async () => {
    if (!module || recordToDelete === null) return;
    setIsDeleting(true);
    try {
      await dynamicSidebarService.deleteRecords(module.id, [recordToDelete]);
      toast.success('Record deleted successfully.');
      setRecordToDelete(null);
      fetchRecords();
      setModule((prev) =>
        prev ? { ...prev, totalRows: Math.max(0, (prev.totalRows || 0) - 1) } : prev
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete Entire Module
  const handleDeleteModule = async () => {
    if (!module) return;
    setIsDeleting(true);
    try {
      await dynamicSidebarService.deleteModule(module.id);
      toast.success(`Module '${module.sidebarName}' deleted successfully.`);
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));
      setShowDeleteModuleConfirm(false);
      navigate('/dynamic-sidebar-builder');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete module.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export
  const handleExport = () => {
    if (!module) return;
    dynamicSidebarService.exportModule(module.id, activeSheet, `${module.moduleSlug}_${activeSheet}.xlsx`);
  };

  // Replace file
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !module) return;

    setIsReplacingFile(true);
    try {
      const updated = await dynamicSidebarService.replaceFile(module.id, file);
      setModule(updated);
      toast.success('Spreadsheet data replaced successfully!');
      fetchRecords();
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to replace spreadsheet data.');
    } finally {
      setIsReplacingFile(false);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Format cell value based on data type or heuristics
  const formatCellValue = (val: any, field?: SidebarField) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-300 dark:text-slate-600 italic">—</span>;
    }

    const strVal = String(val);

    // Heuristics: URL
    if (strVal.startsWith('http://') || strVal.startsWith('https://')) {
      return (
        <a
          href={strVal}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 max-w-[200px] truncate"
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{strVal}</span>
        </a>
      );
    }

    // Heuristics: Boolean
    if (typeof val === 'boolean' || strVal === 'true' || strVal === 'false') {
      const isTrue = val === true || strVal === 'true';
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isTrue
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {isTrue ? 'Yes' : 'No'}
        </span>
      );
    }

    return <span className="truncate max-w-[220px] block">{strVal}</span>;
  };

  // Convert row data to fields array for DetailDrawer
  const drawerFields = useMemo(() => {
    if (!selectedRow) return [];
    return fields.map((f) => {
      const val = selectedRow[f.fieldName] ?? selectedRow[f.fieldLabel] ?? '';
      const str = String(val);
      const isUrl = str.startsWith('http://') || str.startsWith('https://') || str.includes('www.');
      const isPhone =
        f.fieldName.toLowerCase().includes('phone') ||
        f.fieldName.toLowerCase().includes('mobile') ||
        f.fieldName.toLowerCase().includes('contact');
      const isMap =
        f.fieldName.toLowerCase().includes('map') ||
        str.includes('maps.google') ||
        str.includes('goo.gl');
      const isRating =
        f.fieldName.toLowerCase().includes('rating') &&
        !isNaN(Number(str)) &&
        Number(str) <= 5;

      return {
        label: f.fieldLabel || f.fieldName,
        value: val,
        isUrl,
        isPhone,
        isMap,
        isRating,
      };
    });
  }, [selectedRow, fields]);

  if (isLoadingModule) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Loading dynamic module...
        </p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Module Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested dynamic module '{slug}' does not exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/dynamic-sidebar-builder')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
        >
          Go to Module Builder
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {module.sidebarName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                Dynamic Module
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {module.description || `Original Source: ${module.uploadedFileName || 'Uploaded Spreadsheet'}`} · Total records: {module.totalRows?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export to Excel */}
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Export Excel
          </button>

          {/* Replace Spreadsheet */}
          <button
            onClick={() => replaceFileInputRef.current?.click()}
            disabled={isReplacingFile}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isReplacingFile ? 'animate-spin' : ''}`} />
            {isReplacingFile ? 'Replacing...' : 'Replace Spreadsheet'}
          </button>

          {/* Builder Settings Link */}
          <button
            onClick={() => navigate('/dynamic-sidebar-builder')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Settings className="w-3.5 h-3.5" />
            Sidebar Builder
          </button>

          {/* Delete Entire Module */}
          <button
            onClick={() => setShowDeleteModuleConfirm(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900/60 shadow-2xs"
            title="Delete this dynamic module and its data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Module</span>
          </button>
        </div>
      </div>

      {/* Hidden file input for replace action */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Multi-Sheet Selector Tabs (if module contains multiple sheets) */}
      {module.sheetNames && module.sheetNames.length > 1 && (
        <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
            <TableIcon className="w-3.5 h-3.5" /> Sheets:
          </span>
          {module.sheetNames.map((sheet, idx) => (
            <button
              key={idx}
              onClick={() => handleSheetChange(sheet)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSheet === sheet
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sheet}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all columns..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm animate-in fade-in"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
            Showing <span className="font-bold text-slate-900 dark:text-white">{pageInfo.totalElements.toLocaleString()}</span> entries
          </div>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <div className="rounded-3xl bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10 backdrop-blur-md">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={records.length > 0 && selectedIds.length === records.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                </th>

                <th className="py-3 px-3 w-12 text-center text-slate-400">#</th>

                {/* Dynamic Columns from Fields schema */}
                {fields.map((f, i) => (
                  <th
                    key={i}
                    onClick={() => handleSort(f.fieldName)}
                    className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{f.fieldLabel || f.fieldName}</span>
                      {sortField === f.fieldName ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-blue-600" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                ))}

                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {isLoadingRecords ? (
                <tr>
                  <td colSpan={fields.length + 3} className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 3} className="py-16 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No records found matching your search.
                  </td>
                </tr>
              ) : (
                records.map((row, rIdx) => {
                  const isSelected = selectedIds.includes(row.id);
                  const displayIndex = currentPage * pageSize + rIdx + 1;

                  return (
                    <tr
                      key={row.id || rIdx}
                      onClick={() => setSelectedRow(row)}
                      className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 dark:bg-blue-950/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (row.id) handleSelectRow(row.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                      </td>

                      {/* Row Index */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {displayIndex}
                      </td>

                      {/* Dynamic Cell Values */}
                      {fields.map((f, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-3 px-4 text-slate-800 dark:text-slate-200 whitespace-nowrap"
                        >
                          {formatCellValue(row[f.fieldName] ?? row[f.fieldLabel], f)}
                        </td>
                      ))}

                      {/* Row Actions */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedRow(row)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View record details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(row.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-2">
              Page <span className="font-bold text-slate-900 dark:text-white">{currentPage + 1}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.max(1, pageInfo.totalPages)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={pageInfo.first}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
              disabled={pageInfo.last}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Detail Drawer (Uses Portal for clean, professional padding) */}
      {selectedRow && (
        <DetailDrawer
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          title={
            selectedRow[fields[0]?.fieldName]
              ? String(selectedRow[fields[0].fieldName])
              : `Record #${selectedRow.id}`
          }
          subtitle={`Module: ${module.sidebarName} · Sheet: ${activeSheet}`}
          fields={drawerFields}
        />
      )}

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Records"
        message={`Are you sure you want to delete ${selectedIds.length} selected records? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Records'}
        confirmVariant="danger"
        dataType="DynamicRecord"
      />

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleSingleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
        dataType="DynamicRecord"
        dataId={recordToDelete !== null ? recordToDelete : undefined}
        dataTitle={recordToDelete !== null ? `Record #${recordToDelete}` : undefined}
      />

      {/* Delete Module Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModuleConfirm}
        onClose={() => setShowDeleteModuleConfirm(false)}
        onConfirm={handleDeleteModule}
        title="Delete Dynamic Module"
        message={`Are you sure you want to permanently delete the module '${module.sidebarName}'? All extracted fields, uploaded spreadsheets, and ${module.totalRows?.toLocaleString()} records will be permanently removed.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Module'}
        confirmVariant="danger"
        dataType="DynamicModule"
        dataId={module.id}
        dataTitle={module.sidebarName}
      />
    </div>
  );
};
