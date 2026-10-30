import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, ShoppingBag, Globe, ExternalLink, Tag } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { philippinesPetProductService } from '../../services/philippinesPetProductService';
import { PhilippinesPetProduct, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Product Name': z.string().min(1, 'Product Name is required'),
  Country: z.string().optional(),
  'Brand Name': z.string().optional(),
  'Product Description': z.string().optional(),
  'Minimum Price (PHP)': z.coerce.number().optional(),
  'Maximum Price (PHP)': z.coerce.number().optional(),
  'Current Selling Price (PHP)': z.coerce.number().optional(),
  Availability: z.string().optional(),
  'Marketplace Name': z.string().optional(),
  'Product URL': z.string().optional(),
  'Product Image URL': z.string().optional(),
  'Source URL': z.string().optional(),
  Command: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const PhilippinesPetProductsPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<PhilippinesPetProduct> | null>(null);
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
  const [editingItem, setEditingItem] = useState<PhilippinesPetProduct | null>(null);
  const [viewingItem, setViewingItem] = useState<PhilippinesPetProduct | null>(null);
  const [deletingItem, setDeletingItem] = useState<PhilippinesPetProduct | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    setCurrentPage(0);
    setIsAllMatchingSelected(false);
  }, [debouncedSearch, filters, pageSize]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await philippinesPetProductService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load Philippines products directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    philippinesPetProductService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Product Name': '',
      Country: 'Philippines',
      'Brand Name': '',
      'Product Description': '',
      'Minimum Price (PHP)': undefined,
      'Maximum Price (PHP)': undefined,
      'Current Selling Price (PHP)': undefined,
      Availability: 'In Stock',
      'Marketplace Name': 'Shopee PH',
      'Product URL': '',
      'Product Image URL': '',
      'Source URL': '',
      Command: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: PhilippinesPetProduct) => {
    setEditingItem(item);
    reset({
      'Product Name': item['Product Name'] || item.productName || '',
      Country: item.Country || item.country || '',
      'Brand Name': item['Brand Name'] || item.brandName || '',
      'Product Description': item['Product Description'] || item.productDescription || '',
      'Minimum Price (PHP)': item['Minimum Price (PHP)'] ?? item.minimumPricePhp,
      'Maximum Price (PHP)': item['Maximum Price (PHP)'] ?? item.maximumPricePhp,
      'Current Selling Price (PHP)': item['Current Selling Price (PHP)'] ?? item.currentSellingPricePhp,
      Availability: item.Availability || item.availability || '',
      'Marketplace Name': item['Marketplace Name'] || item.marketplaceName || '',
      'Product URL': item['Product URL'] || item.productUrl || '',
      'Product Image URL': item['Product Image URL'] || item.productImageUrl || '',
      'Source URL': item['Source URL'] || item.sourceUrl || '',
      Command: item.Command || item.command || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await philippinesPetProductService.update(editingItem.id, values);
        toast.success('Product updated successfully');
      } else {
        await philippinesPetProductService.create(values);
        toast.success('Product created successfully');
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
      await philippinesPetProductService.delete(deletingItem.id);
      toast.success('Product deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await philippinesPetProductService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No products found to delete');
          return;
        }
        await philippinesPetProductService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} products successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await philippinesPetProductService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} products successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected products');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<PhilippinesPetProduct>[] = [
    {
      header: 'Product Name',
      accessor: 'Product Name',
      sortable: true,
      sortField: 'productName',
      render: (row) => (
        <div className="flex items-center gap-2.5 max-w-[280px]">
          {row['Product Image URL'] || row.productImageUrl ? (
            <img
              src={row['Product Image URL'] || row.productImageUrl}
              alt=""
              className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          )}
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block" title={row['Product Name'] || row.productName}>
            {row['Product Name'] || row.productName || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Brand',
      accessor: 'Brand Name',
      sortable: true,
      sortField: 'brandName',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 whitespace-nowrap">
          {row['Brand Name'] || row.brandName || 'General'}
        </span>
      ),
    },
    {
      header: 'Selling Price',
      accessor: 'Current Selling Price (PHP)',
      sortable: true,
      sortField: 'currentSellingPricePhp',
      render: (row) => {
        const p = row['Current Selling Price (PHP)'] ?? row.currentSellingPricePhp;
        return p !== undefined && p !== null ? (
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            ₱{p.toLocaleString()}
          </span>
        ) : '—';
      },
    },
    {
      header: 'Marketplace',
      accessor: 'Marketplace Name',
      sortable: true,
      sortField: 'marketplaceName',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
          <Tag className="w-3 h-3 text-slate-400" />
          {row['Marketplace Name'] || row.marketplaceName || '—'}
        </span>
      ),
    },
    {
      header: 'Availability',
      accessor: 'Availability',
      render: (row) => {
        const avail = row.Availability || row.availability;
        const inStock = avail && avail.toLowerCase().includes('in stock');
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
            inStock
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {avail || 'Unknown'}
          </span>
        );
      },
    },
    {
      header: 'Product Link',
      accessor: 'Product URL',
      render: (row) => {
        const url = row['Product URL'] || row.productUrl;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 text-xs inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">View</span>
          </a>
        ) : '—';
      },
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Philippines Pet Products</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">E-commerce pet catalogue, marketplace pricing (PHP), and stock intelligence</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete data"
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
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product title, brand, marketplace, availability..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.brandNames && filterOptions.brandNames.length > 0 && (
            <select
              value={filters.brandName || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, brandName: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">All Brands</option>
              {filterOptions.brandNames.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          {filterOptions.marketplaceNames && filterOptions.marketplaceNames.length > 0 && (
            <select
              value={filters.marketplaceName || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, marketplaceName: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">All Marketplaces</option>
              {filterOptions.marketplaceNames.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {filterOptions.availabilities && filterOptions.availabilities.length > 0 && (
            <select
              value={filters.availability || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, availability: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">All Availability</option>
              {filterOptions.availabilities.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-2.5 py-1.5 text-xs text-orange-600 dark:text-orange-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.content || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        isAllMatchingSelected={isAllMatchingSelected}
        onSelectRow={(id) => {
          setIsAllMatchingSelected(false);
          setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        }}
        onSelectAll={(all) => {
          setIsAllMatchingSelected(false);
          if (all && data) {
            setSelectedIds(data.content.map((r: any) => r.id!).filter(Boolean));
          } else {
            setSelectedIds([]);
          }
        }}
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={data?.totalElements || 0}
        totalPages={data?.totalPages || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        onView={setViewingItem}
        onEdit={handleOpenEdit}
        onDelete={setDeletingItem}
      />

      {/* Detail Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={Boolean(viewingItem)}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Product Name'] || viewingItem.productName || 'Product'}
          subtitle={`${viewingItem['Brand Name'] || viewingItem.brandName || ''} • ${viewingItem['Marketplace Name'] || viewingItem.marketplaceName || ''}`}
          fields={[
            { label: 'Product Name', value: viewingItem['Product Name'] || viewingItem.productName },
            { label: 'Brand Name', value: viewingItem['Brand Name'] || viewingItem.brandName },
            { label: 'Current Selling Price', value: (viewingItem['Current Selling Price (PHP)'] ?? viewingItem.currentSellingPricePhp) ? `₱${(viewingItem['Current Selling Price (PHP)'] ?? viewingItem.currentSellingPricePhp)?.toLocaleString()}` : '—' },
            { label: 'Price Range', value: (viewingItem['Minimum Price (PHP)'] ?? viewingItem.minimumPricePhp) ? `₱${viewingItem['Minimum Price (PHP)'] ?? viewingItem.minimumPricePhp} - ₱${viewingItem['Maximum Price (PHP)'] ?? viewingItem.maximumPricePhp}` : '—' },
            { label: 'Availability', value: viewingItem.Availability || viewingItem.availability },
            { label: 'Marketplace Name', value: viewingItem['Marketplace Name'] || viewingItem.marketplaceName },
            { label: 'Country', value: viewingItem.Country || viewingItem.country },
            { label: 'Product URL', value: viewingItem['Product URL'] || viewingItem.productUrl, isUrl: true },
            { label: 'Product Image URL', value: viewingItem['Product Image URL'] || viewingItem.productImageUrl, isUrl: true },
            { label: 'Source URL', value: viewingItem['Source URL'] || viewingItem.sourceUrl, isUrl: true },
            { label: 'Product Description', value: viewingItem['Product Description'] || viewingItem.productDescription },
            { label: 'Command / Notes', value: viewingItem.Command || viewingItem.command },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                {...register('Product Name')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Pedigree Adult Dog Food Beef & Vegetables 10kg"
              />
              {errors['Product Name'] && (
                <p className="text-[11px] text-orange-500 mt-1">{errors['Product Name'].message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
              <input
                type="text"
                {...register('Brand Name')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Pedigree"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Marketplace Name</label>
              <input
                type="text"
                {...register('Marketplace Name')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Shopee PH / Lazada PH"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current Selling Price (PHP)</label>
              <input
                type="number"
                step="0.01"
                {...register('Current Selling Price (PHP)')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 1499.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Availability</label>
              <select
                {...register('Availability')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-Order">Pre-Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum Price (PHP)</label>
              <input
                type="number"
                step="0.01"
                {...register('Minimum Price (PHP)')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 1350.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Maximum Price (PHP)</label>
              <input
                type="number"
                step="0.01"
                {...register('Maximum Price (PHP)')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 1650.00"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Product URL</label>
              <input
                type="text"
                {...register('Product URL')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://shopee.ph/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Product Image URL</label>
              <input
                type="text"
                {...register('Product Image URL')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://cf.shopee.ph/file/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Product Description</label>
              <textarea
                rows={2}
                {...register('Product Description')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Product specifications, ingredients, dietary details..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Command / Operational Notes</label>
              <input
                type="text"
                {...register('Command')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Tracking tags or notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${deletingItem?.['Product Name'] || deletingItem?.productName}? This action cannot be undone.`}
      />

      {/* Bulk Delete */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Philippines Pet Products"
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
    </div>
  );
};

