import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, Star, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { foodService } from '../../services/foodService';
import { FoodProduct, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Product Name': z.string().min(1, 'Product Name is required'),
  'Brand Name': z.string().optional(),
  'Product Category': z.string().optional(),
  'Sub Category': z.string().optional(),
  'Pet Type': z.string().optional(),
  'Life Stage': z.string().optional(),
  'Breed Size': z.string().optional(),
  'Dietary Type': z.string().optional(),
  Formulation: z.string().optional(),
  'Pack Size': z.string().optional(),
  Price: z.coerce.number().optional(),
  Manufacturer: z.string().optional(),
  Availability: z.string().optional(),
  Rating: z.coerce.number().optional(),
  'Reviews Count': z.coerce.number().optional(),
  'Website / Marketplace': z.string().optional(),
  'Product URL': z.string().optional(),
  'Source URL': z.string().optional(),
  Address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const FoodPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<FoodProduct> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentSort, setCurrentSort] = useState('id,desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAllMatchingSelected, setIsAllMatchingSelected] = useState(false);

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodProduct | null>(null);
  const [viewingItem, setViewingItem] = useState<FoodProduct | null>(null);
  const [deletingItem, setDeletingItem] = useState<FoodProduct | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
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

  // Reset page and selection when debounced search, filters or pageSize change
  useEffect(() => {
    setCurrentPage(0);
    setIsAllMatchingSelected(false);
  }, [debouncedSearch, filters, pageSize]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await foodService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load food products');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await foodService.getAll({
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
        const res = await foodService.getAll({
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
    foodService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Product Name': '',
      'Brand Name': '',
      'Product Category': 'Dry Food',
      'Sub Category': '',
      'Pet Type': 'Dog',
      'Life Stage': 'Adult',
      'Breed Size': 'All Breeds',
      'Dietary Type': '',
      Formulation: 'Kibble',
      'Pack Size': '',
      Price: undefined,
      Manufacturer: '',
      Availability: 'In Stock',
      Rating: undefined,
      'Reviews Count': undefined,
      'Website / Marketplace': '',
      'Product URL': '',
      'Source URL': '',
      Address: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: FoodProduct) => {
    setEditingItem(item);
    reset({
      'Product Name': item['Product Name'] || item.productName || '',
      'Brand Name': item['Brand Name'] || item.brandName || '',
      'Product Category': item['Product Category'] || item.productCategory || '',
      'Sub Category': item['Sub Category'] || item.subCategory || '',
      'Pet Type': item['Pet Type'] || item.petType || '',
      'Life Stage': item['Life Stage'] || item.lifeStage || '',
      'Breed Size': item['Breed Size'] || item.breedSize || '',
      'Dietary Type': item['Dietary Type'] || item.dietaryType || '',
      Formulation: item.Formulation || item.formulation || '',
      'Pack Size': item['Pack Size'] || item.packSize || '',
      Price: item.Price ?? item.price,
      Manufacturer: item.Manufacturer || item.manufacturer || '',
      Availability: item.Availability || item.availability || 'In Stock',
      Rating: item.Rating ?? item.rating,
      'Reviews Count': item['Reviews Count'] ?? item.reviewsCount,
      'Website / Marketplace': item['Website / Marketplace'] || item.websiteMarketplace || '',
      'Product URL': item['Product URL'] || item.productUrl || '',
      'Source URL': item['Source URL'] || item.sourceUrl || '',
      Address: item.Address || item.address || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await foodService.update(editingItem.id, values);
        toast.success('Food product updated successfully');
      } else {
        await foodService.create(values);
        toast.success('Food product added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving food product');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await foodService.delete(deletingItem.id);
      toast.success('Food product deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete food product');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await foodService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No food products found to delete');
          return;
        }
        await foodService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} food products successfully`);
      } else {
        const targetIds = (idsOverride && idsOverride.length > 0) ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await foodService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} food products successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete food products');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<FoodProduct>[] = [
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
      header: 'Pet Type',
      accessor: 'Pet Type',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {row['Pet Type'] || row.petType || '—'}
        </span>
      ),
    },
    {
      header: 'Life Stage',
      accessor: 'Life Stage',
      render: (row) => row['Life Stage'] || row.lifeStage || '—',
    },
    {
      header: 'Dietary Type',
      accessor: 'Dietary Type',
      render: (row) => row['Dietary Type'] || row.dietaryType || '—',
    },
    {
      header: 'Pack Size',
      accessor: 'Pack Size',
      render: (row) => row['Pack Size'] || row.packSize || '—',
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Marketplace: Food Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic animal nutrition, dry kibble, prescription diets, and grain-free formulas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete products"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isAllMatchingSelected || selectedIds.length > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 shadow-md animate-pulse'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/70'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isAllMatchingSelected
                ? `Bulk Delete All (${data?.totalElements?.toLocaleString()})`
                : selectedIds.length > 0
                ? `Bulk Delete (${selectedIds.length})`
                : 'Bulk Delete'}
            </span>
          </button>


          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/35 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Food Product
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/30 dark:shadow-black/40 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food by name, brand, breed size, life stage, dietary type, manufacturer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-emerald-500/25"
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

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          <select
            value={filters.brandName || ''}
            onChange={(e) => setFilters({ ...filters, brandName: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Brand (All)</option>
            {filterOptions.brands?.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filters.productCategory || ''}
            onChange={(e) => setFilters({ ...filters, productCategory: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Category (All)</option>
            {filterOptions.categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.petType || ''}
            onChange={(e) => setFilters({ ...filters, petType: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Pet Type (All)</option>
            {filterOptions.petTypes?.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>

          <select
            value={filters.lifeStage || ''}
            onChange={(e) => setFilters({ ...filters, lifeStage: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Life Stage</option>
            {filterOptions.lifeStages?.map((ls) => <option key={ls} value={ls}>{ls}</option>)}
          </select>

          <select
            value={filters.breedSize || ''}
            onChange={(e) => setFilters({ ...filters, breedSize: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Breed Size</option>
            {filterOptions.breedSizes?.map((bs) => <option key={bs} value={bs}>{bs}</option>)}
          </select>

          <select
            value={filters.dietaryType || ''}
            onChange={(e) => setFilters({ ...filters, dietaryType: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Dietary Type</option>
            {filterOptions.dietaryTypes?.map((dt) => <option key={dt} value={dt}>{dt}</option>)}
          </select>

          <select
            value={filters.formulation || ''}
            onChange={(e) => setFilters({ ...filters, formulation: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Formulation</option>
            {filterOptions.formulations?.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filters.availability || ''}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Availability</option>
            {filterOptions.availabilities?.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        isAllMatchingSelected={isAllMatchingSelected}
        onSelectRow={(id) => {
          setIsAllMatchingSelected(false);
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          );
        }}
        onSelectAll={(all) => {
          setIsAllMatchingSelected(false);
          if (all && data) {
            setSelectedIds(data.content.map((r) => r.id!).filter(Boolean));
          } else {
            setSelectedIds([]);
          }
        }}
        onSelectAllMatching={() => {
          setIsAllMatchingSelected(true);
        }}
        onClearAllMatching={() => {
          setIsAllMatchingSelected(false);
          setSelectedIds([]);
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
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(0);
        }}
        nextCursor={data?.nextCursor}
        prevCursor={data?.prevCursor}
        hasMore={data?.hasMore}
        onCursorNext={handleCursorNext}
        onCursorPrev={handleCursorPrev}
        emptyTitle="No food products found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Food Product' : 'Add Food Product'}
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Life Stage</label>
              <input {...register('Life Stage')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Breed Size</label>
              <input {...register('Breed Size')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Dietary Type</label>
              <input {...register('Dietary Type')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Formulation</label>
              <input {...register('Formulation')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Pack Size</label>
              <input {...register('Pack Size')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Price (₹)</label>
              <input type="number" step="0.01" {...register('Price')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Website / Marketplace</label>
              <input {...register('Website / Marketplace')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Product URL</label>
              <input {...register('Product URL')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Source URL</label>
              <input {...register('Source URL')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Address</label>
              <textarea rows={2} {...register('Address')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl">
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
          title={viewingItem['Product Name'] || viewingItem.productName || 'Food Product'}
          subtitle={viewingItem['Brand Name'] || viewingItem.brandName}
          fields={[
            { label: 'Product Name', value: viewingItem['Product Name'] || viewingItem.productName },
            { label: 'Brand Name', value: viewingItem['Brand Name'] || viewingItem.brandName },
            { label: 'Product Category', value: viewingItem['Product Category'] || viewingItem.productCategory },
            { label: 'Sub Category', value: viewingItem['Sub Category'] || viewingItem.subCategory },
            { label: 'Pet Type', value: viewingItem['Pet Type'] || viewingItem.petType },
            { label: 'Life Stage', value: viewingItem['Life Stage'] || viewingItem.lifeStage },
            { label: 'Breed Size', value: viewingItem['Breed Size'] || viewingItem.breedSize },
            { label: 'Dietary Type', value: viewingItem['Dietary Type'] || viewingItem.dietaryType },
            { label: 'Formulation', value: viewingItem.Formulation || viewingItem.formulation },
            { label: 'Pack Size', value: viewingItem['Pack Size'] || viewingItem.packSize },
            { label: 'Price', value: viewingItem.Price ?? viewingItem.price ? `₹${viewingItem.Price ?? viewingItem.price}` : null },
            { label: 'Manufacturer', value: viewingItem.Manufacturer || viewingItem.manufacturer },
            { label: 'Availability', value: viewingItem.Availability || viewingItem.availability },
            { label: 'Rating', value: viewingItem.Rating ?? viewingItem.rating, isRating: true },
            { label: 'Reviews Count', value: viewingItem['Reviews Count'] ?? viewingItem.reviewsCount },
            { label: 'Website / Marketplace', value: viewingItem['Website / Marketplace'] || viewingItem.websiteMarketplace },
            { label: 'Product URL', value: viewingItem['Product URL'] || viewingItem.productUrl, isUrl: true },
            { label: 'Source URL', value: viewingItem['Source URL'] || viewingItem.sourceUrl, isUrl: true },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Food Product"
        message={`Are you sure you want to delete ${deletingItem?.['Product Name'] || deletingItem?.productName}?`}
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Food Products"
        onConfirmDelete={handleBulkDelete}
        currentPageIds={data?.content?.map((r) => r.id!).filter(Boolean) || []}
        onSelectAllCurrentPage={() => {
          setIsAllMatchingSelected(false);
          if (data?.content) {
            setSelectedIds(data.content.map((r) => r.id!).filter(Boolean));
          }
        }}
        onClearSelection={() => {
          setIsAllMatchingSelected(false);
          setSelectedIds([]);
        }}
        isAllMatchingSelected={isAllMatchingSelected}
        isLoading={isBulkDeleting}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleName="Food Products"
        onPreview={(f) => foodService.previewExcel(f)}
        onConfirm={(r) => foodService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Food Products"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await foodService.exportExcel({
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
