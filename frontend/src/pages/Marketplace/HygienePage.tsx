import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, Star, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { hygieneService } from '../../services/hygieneService';
import { HygieneProduct, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Product Name': z.string().min(1, 'Product Name is required'),
  'Brand Name': z.string().optional(),
  'Product Category': z.string().optional(),
  'Sub Category': z.string().optional(),
  'Pet Type': z.string().optional(),
  Formulation: z.string().optional(),
  Dosage: z.string().optional(),
  Price: z.coerce.number().optional(),
  'Pack Size': z.string().optional(),
  Manufacturer: z.string().optional(),
  Availability: z.string().optional(),
  Rating: z.coerce.number().optional(),
  'Reviews Count': z.coerce.number().optional(),
  'Product Link': z.string().optional(),
  'Product URL': z.string().optional(),
  Status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const HygienePage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<HygieneProduct> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentSort, setCurrentSort] = useState('id,desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HygieneProduct | null>(null);
  const [viewingItem, setViewingItem] = useState<HygieneProduct | null>(null);
  const [deletingItem, setDeletingItem] = useState<HygieneProduct | null>(null);
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
      const res = await hygieneService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load hygiene products');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await hygieneService.getAll({
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
        const res = await hygieneService.getAll({
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
    hygieneService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Product Name': '',
      'Brand Name': '',
      'Product Category': '',
      'Sub Category': '',
      'Pet Type': 'Dog, Cat',
      Formulation: '',
      Dosage: '',
      Price: undefined,
      'Pack Size': '',
      Manufacturer: '',
      Availability: 'In Stock',
      Rating: undefined,
      'Reviews Count': undefined,
      'Product Link': '',
      'Product URL': '',
      Status: 'Active',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: HygieneProduct) => {
    setEditingItem(item);
    reset({
      'Product Name': item['Product Name'] || item.productName || '',
      'Brand Name': item['Brand Name'] || item.brandName || '',
      'Product Category': item['Product Category'] || item.productCategory || '',
      'Sub Category': item['Sub Category'] || item.subCategory || '',
      'Pet Type': item['Pet Type'] || item.petType || '',
      Formulation: item.Formulation || item.formulation || '',
      Dosage: item.Dosage || item.dosage || '',
      Price: item.Price ?? item.price,
      'Pack Size': item['Pack Size'] || item.packSize || '',
      Manufacturer: item.Manufacturer || item.manufacturer || '',
      Availability: item.Availability || item.availability || 'In Stock',
      Rating: item.Rating ?? item.rating,
      'Reviews Count': item['Reviews Count'] ?? item.reviewsCount,
      'Product Link': item['Product Link'] || item.productLink || '',
      'Product URL': item['Product URL'] || item.productUrl || '',
      Status: item.Status || item.status || 'Active',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await hygieneService.update(editingItem.id, values);
        toast.success('Hygiene product updated successfully');
      } else {
        await hygieneService.create(values);
        toast.success('Hygiene product added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await hygieneService.delete(deletingItem.id);
      toast.success('Product deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await hygieneService.bulkDelete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} products successfully`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete products');
    }
  };

  const columns: Column<HygieneProduct>[] = [
    {
      header: 'Product Name',
      accessor: 'Product Name',
      sortable: true,
      sortField: 'productName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {row['Product Name'] || row.productName}
          </span>
          <span className="text-xs text-slate-400">
            {row['Brand Name'] || row.brandName || 'Brand N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'Product Category',
      render: (row) => row['Product Category'] || row.productCategory || '—',
    },
    {
      header: 'Sub Category',
      accessor: 'Sub Category',
      render: (row) => row['Sub Category'] || row.subCategory || '—',
    },
    {
      header: 'Pet Type',
      accessor: 'Pet Type',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {row['Pet Type'] || row.petType || '—'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'Price',
      sortable: true,
      sortField: 'price',
      render: (row) => {
        const p = row.Price ?? row.price;
        return p !== undefined && p !== null ? (
          <span className="font-bold text-slate-900 dark:text-slate-100">
            ₹{Number(p).toLocaleString('en-IN')}
          </span>
        ) : '—';
      },
    },
    {
      header: 'Availability',
      accessor: 'Availability',
      render: (row) => {
        const a = row.Availability || row.availability || 'In Stock';
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            {a}
          </span>
        );
      },
    },
    {
      header: 'Rating',
      accessor: 'Rating',
      sortable: true,
      sortField: 'rating',
      render: (row) => {
        const r = row.Rating ?? row.rating;
        return r ? (
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{r}</span>
            <span className="text-slate-400 font-normal">({row['Reviews Count'] ?? row.reviewsCount ?? 0})</span>
          </div>
        ) : '—';
      },
    },
    {
      header: 'Status',
      accessor: 'Status',
      render: (row) => {
        const s = row.Status || row.status || 'Active';
        return (
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {s}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Marketplace: Hygiene Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Veterinary coat care, ear cleaners, dental enzymes, shampoos, and antiparasitics
          </p>
        </div>

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
            Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, brand, category, pet type, manufacturer..."
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

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* 10 Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          <select
            value={filters.brandName || ''}
            onChange={(e) => setFilters({ ...filters, brandName: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Brand (All)</option>
            {filterOptions.brands?.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filters.productCategory || ''}
            onChange={(e) => setFilters({ ...filters, productCategory: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Category (All)</option>
            {filterOptions.categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.subCategory || ''}
            onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Sub Category</option>
            {filterOptions.subCategories?.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
          </select>

          <select
            value={filters.petType || ''}
            onChange={(e) => setFilters({ ...filters, petType: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Pet Type (All)</option>
            {filterOptions.petTypes?.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>

          <select
            value={filters.formulation || ''}
            onChange={(e) => setFilters({ ...filters, formulation: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Formulation (All)</option>
            {filterOptions.formulations?.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filters.manufacturer || ''}
            onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Manufacturer</option>
            {filterOptions.manufacturers?.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={filters.availability || ''}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Availability</option>
            {filterOptions.availabilities?.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Status (All)</option>
            {filterOptions.statuses?.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

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
        emptyTitle="No hygiene products found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal Form */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Hygiene Product' : 'Add Hygiene Product'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('Product Name')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
              {errors['Product Name'] && <span className="text-xs text-rose-500">{String(errors['Product Name']?.message || '')}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Brand Name</label>
              <input {...register('Brand Name')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Product Category</label>
              <input {...register('Product Category')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Sub Category</label>
              <input {...register('Sub Category')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Pet Type</label>
              <input {...register('Pet Type')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Formulation</label>
              <input {...register('Formulation')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Dosage</label>
              <input {...register('Dosage')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Price (₹)</label>
              <input type="number" step="0.01" {...register('Price')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Pack Size</label>
              <input {...register('Pack Size')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Manufacturer</label>
              <input {...register('Manufacturer')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Availability</label>
              <select {...register('Availability')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-order">Pre-order</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Rating</label>
              <input type="number" step="0.1" min="0" max="5" {...register('Rating')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Reviews Count</label>
              <input type="number" {...register('Reviews Count')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Product Link</label>
              <input {...register('Product Link')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Status</label>
              <select {...register('Status')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <option value="Active">Active</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl">
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Product Name'] || viewingItem.productName || 'Hygiene Product'}
          subtitle={viewingItem['Brand Name'] || viewingItem.brandName}
          fields={[
            { label: 'Product Name', value: viewingItem['Product Name'] || viewingItem.productName },
            { label: 'Brand Name', value: viewingItem['Brand Name'] || viewingItem.brandName },
            { label: 'Product Category', value: viewingItem['Product Category'] || viewingItem.productCategory },
            { label: 'Sub Category', value: viewingItem['Sub Category'] || viewingItem.subCategory },
            { label: 'Pet Type', value: viewingItem['Pet Type'] || viewingItem.petType },
            { label: 'Formulation', value: viewingItem.Formulation || viewingItem.formulation },
            { label: 'Dosage', value: viewingItem.Dosage || viewingItem.dosage },
            { label: 'Price', value: viewingItem.Price ?? viewingItem.price ? `₹${viewingItem.Price ?? viewingItem.price}` : null },
            { label: 'Pack Size', value: viewingItem['Pack Size'] || viewingItem.packSize },
            { label: 'Manufacturer', value: viewingItem.Manufacturer || viewingItem.manufacturer },
            { label: 'Availability', value: viewingItem.Availability || viewingItem.availability },
            { label: 'Rating', value: viewingItem.Rating ?? viewingItem.rating, isRating: true },
            { label: 'Reviews Count', value: viewingItem['Reviews Count'] ?? viewingItem.reviewsCount },
            { label: 'Product Link', value: viewingItem['Product Link'] || viewingItem.productLink, isUrl: true },
            { label: 'Product URL', value: viewingItem['Product URL'] || viewingItem.productUrl, isUrl: true },
            { label: 'Status', value: viewingItem.Status || viewingItem.status },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Hygiene Product"
        message={`Are you sure you want to delete ${deletingItem?.['Product Name'] || deletingItem?.productName}?`}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedIds.length} selected products?`}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleName="Hygiene Products"
        onPreview={(f) => hygieneService.previewExcel(f)}
        onConfirm={(r) => hygieneService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Hygiene Products"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await hygieneService.exportExcel({
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
