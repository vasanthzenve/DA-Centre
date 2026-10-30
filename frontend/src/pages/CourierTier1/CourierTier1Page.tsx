import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, Truck, Star, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { courierTier1Service } from '../../services/courierTier1Service';
import { CourierTier1, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Company Name': z.string().min(1, 'Company Name is required'),
  State: z.string().optional(),
  City: z.string().optional(),
  Address: z.string().optional(),
  Pincode: z.string().optional(),
  'Phone Number': z.string().optional(),
  Rating: z.coerce.number().optional(),
  Services: z.string().optional(),
  Website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const CourierTier1Page: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<CourierTier1> | null>(null);
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
  const [editingItem, setEditingItem] = useState<CourierTier1 | null>(null);
  const [viewingItem, setViewingItem] = useState<CourierTier1 | null>(null);
  const [deletingItem, setDeletingItem] = useState<CourierTier1 | null>(null);
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
      const res = await courierTier1Service.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load courier directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    courierTier1Service.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Company Name': '',
      State: '',
      City: '',
      Address: '',
      Pincode: '',
      'Phone Number': '',
      Rating: 4.5,
      Services: 'Domestic Express, Cargo Freight, Same-Day Delivery',
      Website: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: CourierTier1) => {
    setEditingItem(item);
    reset({
      'Company Name': item['Company Name'] || item.companyName || '',
      State: item.State || item.state || '',
      City: item.City || item.city || '',
      Address: item.Address || item.address || '',
      Pincode: item.Pincode || item.pincode || '',
      'Phone Number': item['Phone Number'] || item.phoneNumber || '',
      Rating: item.Rating ?? item.rating,
      Services: item.Services || item.services || '',
      Website: item.Website || item.website || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await courierTier1Service.update(editingItem.id, values);
        toast.success('Courier record updated successfully');
      } else {
        await courierTier1Service.create(values);
        toast.success('Courier record created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving courier record');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await courierTier1Service.delete(deletingItem.id);
      toast.success('Courier record deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete courier record');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await courierTier1Service.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No couriers found to delete');
          return;
        }
        await courierTier1Service.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} couriers successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await courierTier1Service.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} couriers successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected couriers');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<CourierTier1>[] = [
    {
      header: 'Company Name',
      accessor: 'Company Name',
      sortable: true,
      sortField: 'companyName',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[220px]" title={row['Company Name'] || row.companyName}>
          {row['Company Name'] || row.companyName || '—'}
        </span>
      ),
    },
    {
      header: 'City / State',
      accessor: 'City',
      sortable: true,
      sortField: 'city',
      render: (row) => {
        const city = row.City || row.city;
        const state = row.State || row.state;
        return (
          <div className="flex flex-col text-xs text-slate-700 dark:text-slate-300">
            <span className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {city || '—'}
            </span>
            {state && <span className="text-[11px] text-slate-500 dark:text-slate-400">{state}</span>}
          </div>
        );
      },
    },
    {
      header: 'Rating',
      accessor: 'Rating',
      sortable: true,
      sortField: 'rating',
      render: (row) => {
        const rating = row.Rating ?? row.rating;
        return rating !== undefined && rating !== null ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold w-fit">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        ) : '—';
      },
    },
    {
      header: 'Services',
      accessor: 'Services',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 block truncate max-w-[240px]" title={row.Services || row.services}>
          {row.Services || row.services || 'Express Delivery'}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'Phone Number',
      render: (row) => {
        const phone = row['Phone Number'] || row.phoneNumber;
        return phone ? (
          <span className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Phone className="w-3 h-3 text-slate-400" />
            {phone}
          </span>
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
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-700 dark:text-sky-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Courier Tier 1</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Express parcel couriers, air freight, logistics hubs, and cargo carriers</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Courier Tier 1
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name, city, state, services, pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.cities && filterOptions.cities.length > 0 && (
            <select
              value={filters.city || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {filterOptions.states && filterOptions.states.length > 0 && (
            <select
              value={filters.state || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">All States</option>
              {filterOptions.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-2.5 py-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<CourierTier1>
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
          title={viewingItem['Company Name'] || viewingItem.companyName || 'Courier Company'}
          subtitle={`${viewingItem.City || viewingItem.city || ''} • ${viewingItem.State || viewingItem.state || ''}`}
          fields={[
            { label: 'Company Name', value: viewingItem['Company Name'] || viewingItem.companyName },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'City', value: viewingItem.City || viewingItem.city },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
            { label: 'Pincode', value: viewingItem.Pincode || viewingItem.pincode },
            { label: 'Phone Number', value: viewingItem['Phone Number'] || viewingItem.phoneNumber, isPhone: true },
            { label: 'Rating', value: (viewingItem.Rating ?? viewingItem.rating) ? `${viewingItem.Rating ?? viewingItem.rating} / 5` : '—' },
            { label: 'Services', value: viewingItem.Services || viewingItem.services },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Courier Tier 1' : 'Add Courier Tier 1'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                {...register('Company Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Blue Dart Express / DTDC"
              />
              {errors['Company Name'] && <p className="text-rose-500 text-[11px] mt-1">{errors['Company Name'].message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                {...register('State')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                {...register('City')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <input
                {...register('Pincode')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="400099"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                {...register('Phone Number')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="+91 22 2839 6444"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rating</label>
              <input
                {...register('Rating')}
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                {...register('Website')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://bluedart.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Services</label>
              <input
                {...register('Services')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Air Freight, Express Surface Cargo, Priority International"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hub Address</label>
              <textarea
                rows={2}
                {...register('Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full address of the cargo branch or hub..."
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
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Courier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Courier Tier 1 Record"
        message={`Are you sure you want to delete "${deletingItem?.['Company Name'] || deletingItem?.companyName}"? This action cannot be undone.`}
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
        moduleName="Courier Tier 1"
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

