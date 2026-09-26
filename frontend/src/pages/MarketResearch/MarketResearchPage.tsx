import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { marketResearchService } from '../../services/marketResearchService';
import { MarketResearch, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

// Zod Validation Schema
const schema = z.object({
  Company: z.string().min(1, 'Company is required'),
  States: z.string().optional(),
  Founded: z.string().optional(),
  Cities: z.string().optional(),
  Model: z.string().optional(),
  Scale: z.string().optional(),
  Funding: z.string().optional(),
  Service: z.string().optional(),
  Revenue: z.string().optional(),
  'Target Segment': z.string().optional(),
  Price: z.string().optional(),
  Product: z.string().optional(),
  Technology: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const MarketResearchPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<MarketResearch> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  // Query & Pagination state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentSort, setCurrentSort] = useState('id,desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketResearch | null>(null);
  const [viewingItem, setViewingItem] = useState<MarketResearch | null>(null);
  const [deletingItem, setDeletingItem] = useState<MarketResearch | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
  });

  // Reset page when debounced search or filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, filters]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await marketResearchService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load market research data');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await marketResearchService.getAll({
          cursor: data.nextCursor,
          direction: 'next',
          size: pageSize,
          search: debouncedSearch,
          ...filters,
        });
        setData(res);
      } catch (err) {
        toast.error('Failed to load next page');
      } finally {
        setIsLoading(false);
      }
    }
  }, [data?.nextCursor, pageSize, debouncedSearch, filters, toast]);

  const handleCursorPrev = useCallback(async () => {
    if (data?.prevCursor != null) {
      setIsLoading(true);
      try {
        const res = await marketResearchService.getAll({
          cursor: data.prevCursor,
          direction: 'prev',
          size: pageSize,
          search: debouncedSearch,
          ...filters,
        });
        setData(res);
      } catch (err) {
        toast.error('Failed to load previous page');
      } finally {
        setIsLoading(false);
      }
    }
  }, [data?.prevCursor, pageSize, debouncedSearch, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    marketResearchService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Company: '',
      States: '',
      Founded: '',
      Cities: '',
      Model: '',
      Scale: '',
      Funding: '',
      Service: '',
      Revenue: '',
      'Target Segment': '',
      Price: '',
      Product: '',
      Technology: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: MarketResearch) => {
    setEditingItem(item);
    reset({
      Company: item.Company || item.company || '',
      States: item.States || item.states || '',
      Founded: item.Founded || item.founded || '',
      Cities: item.Cities || item.cities || '',
      Model: item.Model || item.model || '',
      Scale: item.Scale || item.scale || '',
      Funding: item.Funding || item.funding || '',
      Service: item.Service || item.service || '',
      Revenue: item.Revenue || item.revenue || '',
      'Target Segment': item['Target Segment'] || item.targetSegment || '',
      Price: item.Price !== undefined && item.Price !== null ? String(item.Price) : (item.price !== undefined && item.price !== null ? String(item.price) : ''),
      Product: item.Product || item.product || '',
      Technology: item.Technology || item.technology || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await marketResearchService.update(editingItem.id, values);
        toast.success('Market research updated successfully');
      } else {
        await marketResearchService.create(values);
        toast.success('Market research added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving record');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await marketResearchService.delete(deletingItem.id);
      toast.success('Record deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete record');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await marketResearchService.bulkDelete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} records successfully`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete records');
    }
  };

  const columns: Column<MarketResearch>[] = [
    {
      header: 'Company',
      accessor: 'Company',
      sortable: true,
      sortField: 'company',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {row.Company || row.company}
          </span>
          <span className="text-xs text-slate-400">
            Founded: {row.Founded || row.founded || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'States',
      accessor: 'States',
      sortable: true,
      sortField: 'states',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {row.States || row.states || '—'}
        </span>
      ),
    },
    {
      header: 'Cities',
      accessor: 'Cities',
      render: (row) => row.Cities || row.cities || '—',
    },
    {
      header: 'Model',
      accessor: 'Model',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.Model || row.model || '—'}
        </span>
      ),
    },
    {
      header: 'Scale',
      accessor: 'Scale',
      render: (row) => row.Scale || row.scale || '—',
    },
    {
      header: 'Target Segment',
      accessor: 'Target Segment',
      render: (row) => row['Target Segment'] || row.targetSegment || '—',
    },
    {
      header: 'Price',
      accessor: 'Price',
      render: (row) => {
        const p = row.Price ?? row.price;
        if (p === undefined || p === null || p === '') return '—';
        let strP = String(p).trim();
        if (!strP) return '—';
        strP = strP.replace(/\?(\d)/g, '₹$1');
        if (!isNaN(Number(strP)) && isFinite(Number(strP))) {
          return `₹${Number(strP).toLocaleString('en-IN')}`;
        }
        return (
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[160px] block" title={strP}>
            {strP}
          </span>
        );
      },
    },
    {
      header: 'Technology',
      accessor: 'Technology',
      render: (row) => {
        let tech = row.Technology || row.technology;
        if (!tech || tech === '—') {
          const prod = row.Product || row.product;
          const p = row.Price ?? row.price;
          if (prod && p && !String(p).includes('₹') && !String(p).includes('?') && !/\d/.test(String(p)) && String(p) !== 'Not publicly disclosed' && String(p) !== 'N/A') {
            tech = prod;
          }
        }
        if (!tech || tech === '—') return '—';
        return (
          <span
            className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px] block"
            title={tech}
          >
            {tech}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Planning &amp; Market Research
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Database of veterinary startups, companies, models, scale, funding &amp; technologies
          </p>
        </div>

        {/* Global CTA actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}


          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Research
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, cities, models, technologies, services..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Filter */}
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* State */}
          <select
            value={filters.state || ''}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All States</option>
            {filterOptions.states?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All Cities</option>
            {filterOptions.cities?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Model */}
          <select
            value={filters.model || ''}
            onChange={(e) => setFilters({ ...filters, model: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All Models</option>
            {filterOptions.models?.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Scale */}
          <select
            value={filters.scale || ''}
            onChange={(e) => setFilters({ ...filters, scale: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All Scales</option>
            {filterOptions.scales?.map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>

          {/* Target Segment */}
          <select
            value={filters.targetSegment || ''}
            onChange={(e) => setFilters({ ...filters, targetSegment: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All Target Segments</option>
            {filterOptions.targetSegments?.map((ts) => (
              <option key={ts} value={ts}>{ts}</option>
            ))}
          </select>

          {/* Technology */}
          <select
            value={filters.technology || ''}
            onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">All Technologies</option>
            {filterOptions.technologies?.map((tech) => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectRow={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          );
        }}
        onSelectAll={(all) => {
          if (all && data) {
            setSelectedIds(data.content.map((r) => r.id!).filter(Boolean));
          } else {
            setSelectedIds([]);
          }
        }}
        onView={(row) => setViewingItem(row)}
        onEdit={(row) => handleOpenEdit(row)}
        onDelete={(row) => setDeletingItem(row)}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        currentPage={currentPage}
        totalPages={data?.totalPages || 0}
        pageSize={pageSize}
        totalElements={data?.totalElements || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        nextCursor={data?.nextCursor}
        prevCursor={data?.prevCursor}
        hasMore={data?.hasMore}
        onCursorNext={handleCursorNext}
        onCursorPrev={handleCursorPrev}
        emptyTitle="No market research records found"
        emptyDescription="Add a company research manually or import from an Excel sheet."
        onAddClick={handleOpenAdd}
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Market Research' : 'Add Market Research'}
        subtitle="Ensure business fields match source of truth specifications"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('Company')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. VetCare Innovations"
              />
              {errors.Company && (
                <span className="text-xs text-rose-500">{String(errors.Company?.message || '')}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                States
              </label>
              <input
                {...register('States')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Tamil Nadu, Karnataka"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Cities
              </label>
              <input
                {...register('Cities')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Chennai, Bengaluru"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Founded
              </label>
              <input
                {...register('Founded')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. 2018"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Model
              </label>
              <input
                {...register('Model')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. B2B SaaS, D2C"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Scale
              </label>
              <input
                {...register('Scale')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Pan-India, Regional"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Funding
              </label>
              <input
                {...register('Funding')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Series A ($4M)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Revenue
              </label>
              <input
                {...register('Revenue')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. $1.8M ARR"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Target Segment
              </label>
              <input
                {...register('Target Segment')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Veterinary Hospitals"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Price
              </label>
              <input
                type="text"
                {...register('Price')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. ₹500 consultation / Not publicly disclosed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Product
              </label>
              <input
                {...register('Product')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. VetCloud 360"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Technology
              </label>
              <input
                {...register('Technology')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Spring Boot, React, AWS"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Service
              </label>
              <textarea
                rows={2}
                {...register('Service')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Veterinary EHR and diagnostics management..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Research'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem.Company || viewingItem.company || 'Research Company'}
          subtitle={viewingItem.States || viewingItem.states}
          fields={[
            { label: 'Company', value: viewingItem.Company || viewingItem.company },
            { label: 'States', value: viewingItem.States || viewingItem.states },
            { label: 'Cities', value: viewingItem.Cities || viewingItem.cities },
            { label: 'Founded', value: viewingItem.Founded || viewingItem.founded },
            { label: 'Model', value: viewingItem.Model || viewingItem.model },
            { label: 'Scale', value: viewingItem.Scale || viewingItem.scale },
            { label: 'Funding', value: viewingItem.Funding || viewingItem.funding },
            { label: 'Revenue', value: viewingItem.Revenue || viewingItem.revenue },
            { label: 'Target Segment', value: viewingItem['Target Segment'] || viewingItem.targetSegment },
            {
              label: 'Price',
              value: (() => {
                const p = viewingItem.Price ?? viewingItem.price;
                if (p === undefined || p === null || p === '') return null;
                const strP = String(p).trim();
                if (!isNaN(Number(strP)) && isFinite(Number(strP))) {
                  return `₹${Number(strP).toLocaleString('en-IN')}`;
                }
                return strP;
              })(),
            },
            { label: 'Product', value: viewingItem.Product || viewingItem.product },
            { label: 'Technology', value: viewingItem.Technology || viewingItem.technology },
            { label: 'Service', value: viewingItem.Service || viewingItem.service },
          ]}
        />
      )}

      {/* Delete Single Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Market Research"
        message={`Are you sure you want to delete ${deletingItem?.Company || deletingItem?.company}? This action cannot be undone.`}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Records"
        message={`Are you sure you want to delete ${selectedIds.length} selected market research records? This action cannot be undone.`}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleName="Market Research"
        onPreview={(file) => marketResearchService.previewExcel(file)}
        onConfirm={(rows) => marketResearchService.confirmImport(rows)}
        onSuccess={fetchData}
      />

      {/* Excel Export Modal */}
      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Market Research"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await marketResearchService.exportExcel({
            ...req,
            selectedIds,
            search,
            filters,
          });
        }}
      />
    </div>
  );
};
