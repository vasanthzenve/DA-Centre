import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, Factory, Globe, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { petManufacturerService } from '../../services/petManufacturerService';
import { PetManufacturer, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Manufacturer_Name: z.string().min(1, 'Manufacturer Name is required'),
  country: z.string().optional(),
  Manufacturer_Address: z.string().optional(),
  Product_Category: z.string().optional(),
  Mobile_Number: z.string().optional(),
  Email_ID: z.string().optional(),
  Website: z.string().optional(),
  'Export Countries': z.string().optional(),
  'Source URL': z.string().optional(),
  Verification: z.string().optional(),
  Analyst: z.string().optional(),
  command: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const PetManufacturersPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<PetManufacturer> | null>(null);
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
  const [editingItem, setEditingItem] = useState<PetManufacturer | null>(null);
  const [viewingItem, setViewingItem] = useState<PetManufacturer | null>(null);
  const [deletingItem, setDeletingItem] = useState<PetManufacturer | null>(null);
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
      const res = await petManufacturerService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load pet manufacturers directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    petManufacturerService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Manufacturer_Name: '',
      country: 'India',
      Manufacturer_Address: '',
      Product_Category: 'Pet Food & Nutritional Supplements',
      Mobile_Number: '',
      Email_ID: '',
      Website: '',
      'Export Countries': 'USA, UK, UAE, Germany, Australia',
      'Source URL': '',
      Verification: 'Verified',
      Analyst: '',
      command: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: PetManufacturer) => {
    setEditingItem(item);
    reset({
      Manufacturer_Name: item.Manufacturer_Name || item.manufacturerName || '',
      country: item.country || '',
      Manufacturer_Address: item.Manufacturer_Address || item.manufacturerAddress || '',
      Product_Category: item.Product_Category || item.productCategory || '',
      Mobile_Number: item.Mobile_Number || item.mobileNumber || '',
      Email_ID: item.Email_ID || item.emailId || '',
      Website: item.Website || item.website || '',
      'Export Countries': item['Export Countries'] || item.exportCountries || '',
      'Source URL': item['Source URL'] || item.sourceUrl || '',
      Verification: item.Verification || item.verification || '',
      Analyst: item.Analyst || item.analyst || '',
      command: item.command || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await petManufacturerService.update(editingItem.id, values);
        toast.success('Manufacturer record updated successfully');
      } else {
        await petManufacturerService.create(values);
        toast.success('Manufacturer record created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving manufacturer record');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await petManufacturerService.delete(deletingItem.id);
      toast.success('Manufacturer record deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete manufacturer record');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await petManufacturerService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No manufacturers found to delete');
          return;
        }
        await petManufacturerService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} manufacturers successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await petManufacturerService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} manufacturers successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected manufacturers');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<PetManufacturer>[] = [
    {
      header: 'Manufacturer Name',
      accessor: 'Manufacturer_Name',
      sortable: true,
      sortField: 'manufacturerName',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[220px]" title={row.Manufacturer_Name || row.manufacturerName}>
          {row.Manufacturer_Name || row.manufacturerName || '—'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'Product_Category',
      sortable: true,
      sortField: 'productCategory',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
          {row.Product_Category || row.productCategory || 'Pet Products'}
        </span>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
      sortable: true,
      sortField: 'country',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          {row.country || '—'}
        </span>
      ),
    },
    {
      header: 'Export Countries',
      accessor: 'Export Countries',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 block truncate max-w-[200px]" title={row['Export Countries'] || row.exportCountries}>
          {row['Export Countries'] || row.exportCountries || '—'}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'Mobile_Number',
      render: (row) => {
        const phone = row.Mobile_Number || row.mobileNumber;
        const email = row.Email_ID || row.emailId;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-slate-600 dark:text-slate-400">
            {phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{phone}</span>}
            {email && <span className="flex items-center gap-1 truncate max-w-[140px]"><Mail className="w-3 h-3 text-slate-400" />{email}</span>}
            {!phone && !email && '—'}
          </div>
        );
      },
    },
    {
      header: 'Verification',
      accessor: 'Verification',
      render: (row) => {
        const status = row.Verification || row.verification;
        const isVerified = status && status.toLowerCase().includes('verif');
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
            isVerified
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}>
            {status || 'Pending'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Pet Manufacturers</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pet food processors, cage & accessory fabricators, OEM exporters, and global plants</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Pet Manufacturer
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search manufacturer name, category, country, export markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.countries && filterOptions.countries.length > 0 && (
            <select
              value={filters.country || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {filterOptions.productCategories && filterOptions.productCategories.length > 0 && (
            <select
              value={filters.productCategory || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, productCategory: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Categories</option>
              {filterOptions.productCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<PetManufacturer>
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
          title={viewingItem.Manufacturer_Name || viewingItem.manufacturerName || 'Pet Manufacturer'}
          subtitle={`${viewingItem.Product_Category || viewingItem.productCategory || ''} • ${viewingItem.country || ''}`}
          fields={[
            { label: 'Manufacturer Name', value: viewingItem.Manufacturer_Name || viewingItem.manufacturerName },
            { label: 'Country', value: viewingItem.country },
            { label: 'Product Category', value: viewingItem.Product_Category || viewingItem.productCategory },
            { label: 'Export Countries', value: viewingItem['Export Countries'] || viewingItem.exportCountries },
            { label: 'Manufacturer Address', value: viewingItem.Manufacturer_Address || viewingItem.manufacturerAddress },
            { label: 'Mobile Number', value: viewingItem.Mobile_Number || viewingItem.mobileNumber, isPhone: true },
            { label: 'Email ID', value: viewingItem.Email_ID || viewingItem.emailId },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Source URL', value: viewingItem['Source URL'] || viewingItem.sourceUrl, isUrl: true },
            { label: 'Verification Status', value: viewingItem.Verification || viewingItem.verification },
            { label: 'Analyst', value: viewingItem.Analyst || viewingItem.analyst },
            { label: 'Command / Notes', value: viewingItem.command },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Pet Manufacturer' : 'Add Pet Manufacturer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer Name *
              </label>
              <input
                {...register('Manufacturer_Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Mars Petcare / Drools Pet Food"
              />
              {errors.Manufacturer_Name && <p className="text-rose-500 text-[11px] mt-1">{errors.Manufacturer_Name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
              <input
                {...register('country')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="India / USA / Thailand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Category</label>
              <input
                {...register('Product_Category')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Pet Food & Nutrition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / Phone</label>
              <input
                {...register('Mobile_Number')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="+91 1800 123 4567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
              <input
                {...register('Email_ID')}
                type="email"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="export@marspetcare.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                {...register('Website')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://drools.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source URL</label>
              <input
                {...register('Source URL')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Export Countries</label>
              <input
                {...register('Export Countries')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="USA, UK, UAE, Germany, Australia, Singapore"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Plant / Manufacturer Address</label>
              <textarea
                rows={2}
                {...register('Manufacturer_Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full plant or factory street address..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Verification Status</label>
              <input
                {...register('Verification')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Verified / ISO Certified"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Analyst</label>
              <input
                {...register('Analyst')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Analyst Name"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Command / Remarks</label>
              <input
                {...register('command')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Internal audit notes or tags"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Manufacturer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Pet Manufacturer Record"
        message={`Are you sure you want to delete "${deletingItem?.Manufacturer_Name || deletingItem?.manufacturerName}"? This action cannot be undone.`}
        confirmText="Delete Record"
        confirmVariant="danger"
      />

      {/* Bulk Delete */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Pet Manufacturers"
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

