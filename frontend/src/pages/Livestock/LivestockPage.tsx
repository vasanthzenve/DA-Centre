import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, Beef, Star, MapPin, Phone, Mail, Globe, Map } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { livestockService } from '../../services/livestockService';
import { Livestock, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Name: z.string().min(1, 'Farm or Livestock Name is required'),
  Livestock_Type: z.string().optional(),
  Farm_Type: z.string().optional(),
  Contact_Number: z.string().optional(),
  Email: z.string().optional(),
  Website: z.string().optional(),
  Address: z.string().optional(),
  Area: z.string().optional(),
  District: z.string().optional(),
  State: z.string().optional(),
  Pincode: z.string().optional(),
  Services: z.string().optional(),
  Rating: z.coerce.number().optional(),
  Reviews_Count: z.coerce.number().optional(),
  Business_Status: z.string().optional(),
  Google_Maps: z.string().optional(),
  Source_URL: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const LivestockPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<Livestock> | null>(null);
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
  const [editingItem, setEditingItem] = useState<Livestock | null>(null);
  const [viewingItem, setViewingItem] = useState<Livestock | null>(null);
  const [deletingItem, setDeletingItem] = useState<Livestock | null>(null);
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
      const res = await livestockService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load livestock directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    livestockService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Name: '',
      Livestock_Type: 'Dairy Cattle',
      Farm_Type: 'Commercial Dairy Farm',
      Contact_Number: '',
      Email: '',
      Website: '',
      Address: '',
      Area: '',
      District: '',
      State: '',
      Pincode: '',
      Services: 'Milk Supply, Cattle Breeding, Feed Distribution',
      Rating: 4.5,
      Reviews_Count: 15,
      Business_Status: 'Operational',
      Google_Maps: '',
      Source_URL: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: Livestock) => {
    setEditingItem(item);
    reset({
      Name: item.Name || item.name || '',
      Livestock_Type: item.Livestock_Type || item.livestockType || '',
      Farm_Type: item.Farm_Type || item.farmType || '',
      Contact_Number: item.Contact_Number || item.contactNumber || '',
      Email: item.Email || item.email || '',
      Website: item.Website || item.website || '',
      Address: item.Address || item.address || '',
      Area: item.Area || item.area || '',
      District: item.District || item.district || '',
      State: item.State || item.state || '',
      Pincode: item.Pincode || item.pincode || '',
      Services: item.Services || item.services || '',
      Rating: item.Rating ?? item.rating,
      Reviews_Count: item.Reviews_Count ?? item.reviewsCount,
      Business_Status: item.Business_Status || item.businessStatus || '',
      Google_Maps: item.Google_Maps || item.googleMaps || '',
      Source_URL: item.Source_URL || item.sourceUrl || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await livestockService.update(editingItem.id, values);
        toast.success('Livestock record updated successfully');
      } else {
        await livestockService.create(values);
        toast.success('Livestock record created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving livestock record');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await livestockService.delete(deletingItem.id);
      toast.success('Livestock record deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete livestock record');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await livestockService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No livestock records found to delete');
          return;
        }
        await livestockService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} livestock records successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await livestockService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} livestock records successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected livestock records');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<Livestock>[] = [
    {
      header: 'Farm / Entity Name',
      accessor: 'Name',
      sortable: true,
      sortField: 'name',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[220px]" title={row.Name || row.name}>
          {row.Name || row.name || '—'}
        </span>
      ),
    },
    {
      header: 'Livestock Type',
      accessor: 'Livestock_Type',
      sortable: true,
      sortField: 'livestockType',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
          {row.Livestock_Type || row.livestockType || 'General'}
        </span>
      ),
    },
    {
      header: 'Farm Type',
      accessor: 'Farm_Type',
      sortable: true,
      sortField: 'farmType',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {row.Farm_Type || row.farmType || '—'}
        </span>
      ),
    },
    {
      header: 'District / State',
      accessor: 'District',
      sortable: true,
      sortField: 'district',
      render: (row) => {
        const dist = row.District || row.district;
        const state = row.State || row.state;
        return (
          <div className="flex flex-col text-xs text-slate-700 dark:text-slate-300">
            <span className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {dist || '—'}
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
        const count = row.Reviews_Count ?? row.reviewsCount;
        return rating !== undefined && rating !== null ? (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rating}
            </span>
            {count !== undefined && <span className="text-[11px] text-slate-400">({count})</span>}
          </div>
        ) : '—';
      },
    },
    {
      header: 'Contact',
      accessor: 'Contact_Number',
      render: (row) => {
        const phone = row.Contact_Number || row.contactNumber;
        const email = row.Email || row.email;
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
      header: 'Status',
      accessor: 'Business_Status',
      render: (row) => {
        const status = row.Business_Status || row.businessStatus;
        const isActive = status && (status.toLowerCase().includes('operat') || status.toLowerCase().includes('activ'));
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}>
            {status || 'Active'}
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
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400">
              <Beef className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Livestock</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dairy farms, cattle breeders, stud farms, and livestock supply operations</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Livestock Farm
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farm name, livestock type, district, state, services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.livestockTypes && filterOptions.livestockTypes.length > 0 && (
            <select
              value={filters.livestockType || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, livestockType: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Types</option>
              {filterOptions.livestockTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {filterOptions.states && filterOptions.states.length > 0 && (
            <select
              value={filters.state || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All States</option>
              {filterOptions.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {filterOptions.districts && filterOptions.districts.length > 0 && (
            <select
              value={filters.district || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All Districts</option>
              {filterOptions.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
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
          title={viewingItem.Name || viewingItem.name || 'Livestock Farm'}
          subtitle={`${viewingItem.Livestock_Type || viewingItem.livestockType || ''} • ${viewingItem.District || viewingItem.district || ''}`}
          fields={[
            { label: 'Name', value: viewingItem.Name || viewingItem.name },
            { label: 'Livestock Type', value: viewingItem.Livestock_Type || viewingItem.livestockType },
            { label: 'Farm Type', value: viewingItem.Farm_Type || viewingItem.farmType },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'District', value: viewingItem.District || viewingItem.district },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
            { label: 'Pincode', value: viewingItem.Pincode || viewingItem.pincode },
            { label: 'Contact Number', value: viewingItem.Contact_Number || viewingItem.contactNumber, isPhone: true },
            { label: 'Email', value: viewingItem.Email || viewingItem.email },
            { label: 'Rating', value: (viewingItem.Rating ?? viewingItem.rating) ? `${viewingItem.Rating ?? viewingItem.rating} / 5` : '—' },
            { label: 'Reviews Count', value: viewingItem.Reviews_Count ?? viewingItem.reviewsCount },
            { label: 'Services', value: viewingItem.Services || viewingItem.services },
            { label: 'Business Status', value: viewingItem.Business_Status || viewingItem.businessStatus },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Google Maps', value: viewingItem.Google_Maps || viewingItem.googleMaps, isMap: true },
            { label: 'Source URL', value: viewingItem.Source_URL || viewingItem.sourceUrl, isUrl: true },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Livestock Record' : 'Add Livestock Record'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Farm / Entity Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                {...register('Name')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Chitale Dairy Farm & Breeders"
              />
              {errors.Name && (
                <p className="text-[11px] text-amber-500 mt-1">{errors.Name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Livestock Type</label>
              <input
                type="text"
                {...register('Livestock_Type')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Dairy Cattle, Murrah Buffalo, Boer Goats"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Farm Type</label>
              <input
                type="text"
                {...register('Farm_Type')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Commercial Dairy, Stud Breeding Farm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                {...register('State')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Maharashtra"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">District</label>
              <input
                type="text"
                {...register('District')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Sangli"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Area / Village</label>
              <input
                type="text"
                {...register('Area')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Bhilawadi"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <input
                type="text"
                {...register('Pincode')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 416303"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input
                type="text"
                {...register('Contact_Number')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. +91 2346 232000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                {...register('Email')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. contact@chitale.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('Rating')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 4.6"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Reviews Count</label>
              <input
                type="number"
                {...register('Reviews_Count')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. 24"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Business Status</label>
              <select
                {...register('Business_Status')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Operational">Operational</option>
                <option value="Active">Active</option>
                <option value="Verified">Verified</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                type="text"
                {...register('Website')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. https://www.chitalegroup.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Services</label>
              <input
                type="text"
                {...register('Services')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Artificial Insemination, High-Yield Milk Production, Cattle Feed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <textarea
                rows={2}
                {...register('Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full farm or dairy plant location..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Google Maps Pin</label>
              <input
                type="text"
                {...register('Google_Maps')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Source URL</label>
              <input
                type="text"
                {...register('Source_URL')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://..."
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
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Livestock Record"
        message={`Are you sure you want to delete ${deletingItem?.Name || deletingItem?.name}? This action cannot be undone.`}
      />

      {/* Bulk Delete */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Livestock"
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

