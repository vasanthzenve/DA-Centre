import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { accessoryService } from '../../services/accessoryService';
import { Accessory, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Business Name': z.string().min(1, 'Business Name is required'),
  Category: z.string().optional(),
  'Sub Category': z.string().optional(),
  'Pet Type': z.string().optional(),
  'Product Description': z.string().optional(),
  Price: z.coerce.number().optional(),
  Availability: z.string().optional(),
  'Review Count': z.coerce.number().optional(),
  Website: z.string().optional(),
  'Product URL': z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const AccessoriesPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<Accessory> | null>(null);
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
  const [editingItem, setEditingItem] = useState<Accessory | null>(null);
  const [viewingItem, setViewingItem] = useState<Accessory | null>(null);
  const [deletingItem, setDeletingItem] = useState<Accessory | null>(null);
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
      const res = await accessoryService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load accessories');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await accessoryService.getAll({
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
        const res = await accessoryService.getAll({
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
    accessoryService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Business Name': '',
      Category: 'Walking Gear',
      'Sub Category': '',
      'Pet Type': 'Dog',
      'Product Description': '',
      Price: undefined,
      Availability: 'In Stock',
      'Review Count': undefined,
      Website: '',
      'Product URL': '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: Accessory) => {
    setEditingItem(item);
    reset({
      'Business Name': item['Business Name'] || item.businessName || '',
      Category: item.Category || item.category || '',
      'Sub Category': item['Sub Category'] || item.subCategory || '',
      'Pet Type': item['Pet Type'] || item.petType || '',
      'Product Description': item['Product Description'] || item.productDescription || '',
      Price: item.Price ?? item.price,
      Availability: item.Availability || item.availability || 'In Stock',
      'Review Count': item['Review Count'] ?? item.reviewCount,
      Website: item.Website || item.website || '',
      'Product URL': item['Product URL'] || item.productUrl || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await accessoryService.update(editingItem.id, values);
        toast.success('Accessory updated successfully');
      } else {
        await accessoryService.create(values);
        toast.success('Accessory added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving accessory');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await accessoryService.delete(deletingItem.id);
      toast.success('Accessory deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete accessory');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await accessoryService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No accessories found to delete');
          return;
        }
        await accessoryService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} accessories successfully`);
      } else {
        const targetIds = (idsOverride && idsOverride.length > 0) ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await accessoryService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} accessories successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete accessories');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<Accessory>[] = [
    {
      header: 'Business Name',
      accessor: 'Business Name',
      sortable: true,
      sortField: 'businessName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {row['Business Name'] || row.businessName}
          </span>
          <span className="text-xs text-slate-400">
            {row.Category || row.category || 'Gear'}
          </span>
        </div>
      ),
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
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
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
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          {row.Availability || row.availability || 'In Stock'}
        </span>
      ),
    },
    {
      header: 'Reviews',
      accessor: 'Review Count',
      render: (row) => `${row['Review Count'] ?? row.reviewCount ?? 0} reviews`,
    },
    {
      header: 'Links',
      render: (row) => {
        const web = row.Website || row.website;
        const purl = row['Product URL'] || row.productUrl;
        return (
          <div className="flex items-center gap-2">
            {web && (
              <a href={web} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                <ExternalLink className="w-3 h-3" /> Web
              </a>
            )}
            {purl && (
              <a href={purl} target="_blank" rel="noreferrer" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5">
                <ExternalLink className="w-3 h-3" /> Shop
              </a>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Marketplace: Accessories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Wearables, orthopedic bedding, walking harnesses, GPS collars &amp; travel carriers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete accessories"
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
            Add Accessory
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/30 dark:shadow-black/40 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessories by business name, category, description, pet type..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-emerald-500/25"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {Object.keys(filters).length > 0 && (
            <button onClick={() => setFilters({})} className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* 6 Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <select
            value={filters.businessName || ''}
            onChange={(e) => setFilters({ ...filters, businessName: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Business (All)</option>
            {filterOptions.businessNames?.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Category (All)</option>
            {filterOptions.categories?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filters.subCategory || ''}
            onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Sub Category</option>
            {filterOptions.subCategories?.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
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
        emptyTitle="No accessories found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Accessory' : 'Add Accessory'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input {...register('Business Name')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
              {errors['Business Name'] && <span className="text-xs text-rose-500">{String(errors['Business Name']?.message || '')}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Category</label>
              <input {...register('Category')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Price (₹)</label>
              <input type="number" step="0.01" {...register('Price')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Availability</label>
              <select {...register('Availability')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Review Count</label>
              <input type="number" {...register('Review Count')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Website</label>
              <input {...register('Website')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Product URL</label>
              <input {...register('Product URL')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Product Description</label>
              <textarea rows={2} {...register('Product Description')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl">
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Accessory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Business Name'] || viewingItem.businessName || 'Accessory'}
          subtitle={viewingItem.Category || viewingItem.category}
          fields={[
            { label: 'Business Name', value: viewingItem['Business Name'] || viewingItem.businessName },
            { label: 'Category', value: viewingItem.Category || viewingItem.category },
            { label: 'Sub Category', value: viewingItem['Sub Category'] || viewingItem.subCategory },
            { label: 'Pet Type', value: viewingItem['Pet Type'] || viewingItem.petType },
            { label: 'Price', value: viewingItem.Price ?? viewingItem.price ? `₹${viewingItem.Price ?? viewingItem.price}` : null },
            { label: 'Availability', value: viewingItem.Availability || viewingItem.availability },
            { label: 'Review Count', value: viewingItem['Review Count'] ?? viewingItem.reviewCount },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Product URL', value: viewingItem['Product URL'] || viewingItem.productUrl, isUrl: true },
            { label: 'Product Description', value: viewingItem['Product Description'] || viewingItem.productDescription },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Accessory"
        message={`Are you sure you want to delete ${deletingItem?.['Business Name'] || deletingItem?.businessName}?`}
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Accessories"
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
        moduleName="Accessories"
        onPreview={(f) => accessoryService.previewExcel(f)}
        onConfirm={(r) => accessoryService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Accessories"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await accessoryService.exportExcel({
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
