import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, Egg, Star, MapPin, Phone, Globe, ExternalLink, Tag } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { poultryService } from '../../services/poultryService';
import { Poultry, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Name: z.string().min(1, 'Poultry Farm / Company Name is required'),
  Category: z.string().optional(),
  Sub_Category: z.string().optional(),
  Phone: z.string().optional(),
  Website: z.string().optional(),
  Address: z.string().optional(),
  Area: z.string().optional(),
  District: z.string().optional(),
  State: z.string().optional(),
  Pincode: z.string().optional(),
  Business_Tag: z.string().optional(),
  Rating: z.coerce.number().optional(),
  Reviews: z.string().optional(),
  Status: z.string().optional(),
  Source: z.string().optional(),
  Maps_Link: z.string().optional(),
  Analyst: z.string().optional(),
  Notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const PoultryPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<Poultry> | null>(null);
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
  const [editingItem, setEditingItem] = useState<Poultry | null>(null);
  const [viewingItem, setViewingItem] = useState<Poultry | null>(null);
  const [deletingItem, setDeletingItem] = useState<Poultry | null>(null);
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
      const res = await poultryService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load poultry directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    poultryService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Name: '',
      Category: 'Broiler & Layer Farming',
      Sub_Category: 'Commercial Hatchery',
      Phone: '',
      Website: '',
      Address: '',
      Area: '',
      District: '',
      State: '',
      Pincode: '',
      Business_Tag: 'Poultry Farm',
      Rating: 4.5,
      Reviews: '25',
      Status: 'Active',
      Source: 'Google Maps Directory',
      Maps_Link: '',
      Analyst: '',
      Notes: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: Poultry) => {
    setEditingItem(item);
    reset({
      Name: item.Name || item.name || '',
      Category: item.Category || item.category || '',
      Sub_Category: item.Sub_Category || item.subCategory || '',
      Phone: item.Phone || item.phone || '',
      Website: item.Website || item.website || '',
      Address: item.Address || item.address || '',
      Area: item.Area || item.area || '',
      District: item.District || item.district || '',
      State: item.State || item.state || '',
      Pincode: item.Pincode || item.pincode || '',
      Business_Tag: item.Business_Tag || item.businessTag || '',
      Rating: item.Rating ?? item.rating,
      Reviews: item.Reviews || item.reviews || '',
      Status: item.Status || item.status || '',
      Source: item.Source || item.source || '',
      Maps_Link: item.Maps_Link || item.mapsLink || '',
      Analyst: item.Analyst || item.analyst || '',
      Notes: item.Notes || item.notes || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await poultryService.update(editingItem.id, values);
        toast.success('Poultry farm record updated successfully');
      } else {
        await poultryService.create(values);
        toast.success('Poultry farm record created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving poultry farm record');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await poultryService.delete(deletingItem.id);
      toast.success('Poultry farm record deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete poultry farm record');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await poultryService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No poultry records found to delete');
          return;
        }
        await poultryService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} poultry records successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await poultryService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} poultry records successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected poultry records');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<Poultry>[] = [
    {
      header: 'Poultry Farm / Company',
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
      header: 'Category / Tag',
      accessor: 'Category',
      sortable: true,
      sortField: 'category',
      render: (row) => {
        const cat = row.Category || row.category;
        const tag = row.Business_Tag || row.businessTag;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap inline-block w-fit">
              {cat || 'Poultry Farm'}
            </span>
            {tag && <span className="text-[11px] text-slate-500 dark:text-slate-400">{tag}</span>}
          </div>
        );
      },
    },
    {
      header: 'Sub Category',
      accessor: 'Sub_Category',
      sortable: true,
      sortField: 'subCategory',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {row.Sub_Category || row.subCategory || '—'}
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
        const reviews = row.Reviews || row.reviews;
        return rating !== undefined && rating !== null ? (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rating}
            </span>
            {reviews && <span className="text-[11px] text-slate-400">({reviews})</span>}
          </div>
        ) : '—';
      },
    },
    {
      header: 'Phone / Contact',
      accessor: 'Phone',
      render: (row) => {
        const phone = row.Phone || row.phone;
        return phone ? (
          <span className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Phone className="w-3 h-3 text-slate-400" />
            {phone}
          </span>
        ) : '—';
      },
    },
    {
      header: 'Status',
      accessor: 'Status',
      render: (row) => {
        const status = row.Status || row.status;
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
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400">
              <Egg className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Poultry Directory</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Broiler farms, hatcheries, layer breeders, poultry feed & equipment providers</p>
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
            Add Poultry Farm
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search farm name, category, district, state, tags..."
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
          {filterOptions.categories && filterOptions.categories.length > 0 && (
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {filterOptions.states && filterOptions.states.length > 0 && (
            <select
              value={filters.state || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              className="px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<Poultry>
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
          title={viewingItem.Name || viewingItem.name || 'Poultry Farm'}
          subtitle={`${viewingItem.Category || viewingItem.category || ''} • ${viewingItem.District || viewingItem.district || ''}`}
          fields={[
            { label: 'Farm / Company Name', value: viewingItem.Name || viewingItem.name },
            { label: 'Category', value: viewingItem.Category || viewingItem.category },
            { label: 'Sub Category', value: viewingItem.Sub_Category || viewingItem.subCategory },
            { label: 'Business Tag', value: viewingItem.Business_Tag || viewingItem.businessTag },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'District', value: viewingItem.District || viewingItem.district },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
            { label: 'Pincode', value: viewingItem.Pincode || viewingItem.pincode },
            { label: 'Phone', value: viewingItem.Phone || viewingItem.phone, isPhone: true },
            { label: 'Rating', value: (viewingItem.Rating ?? viewingItem.rating) ? `${viewingItem.Rating ?? viewingItem.rating} / 5` : '—' },
            { label: 'Reviews', value: viewingItem.Reviews || viewingItem.reviews },
            { label: 'Status', value: viewingItem.Status || viewingItem.status },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Google Maps Link', value: viewingItem.Maps_Link || viewingItem.mapsLink, isMap: true },
            { label: 'Source', value: viewingItem.Source || viewingItem.source, isUrl: true },
            { label: 'Analyst', value: viewingItem.Analyst || viewingItem.analyst },
            { label: 'Notes', value: viewingItem.Notes || viewingItem.notes },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Poultry Farm Record' : 'Add New Poultry Farm Record'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Farm / Company Name *
              </label>
              <input
                {...register('Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Suguna Foods / Venkateshwara Hatcheries"
              />
              {errors.Name && <p className="text-rose-500 text-[11px] mt-1">{errors.Name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <input
                {...register('Category')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Broiler & Layer Farming"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub Category</label>
              <input
                {...register('Sub_Category')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Commercial Hatchery"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                {...register('Phone')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                {...register('Website')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                {...register('Address')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Full farm or office address"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Area / Locality</label>
              <input
                {...register('Area')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Sector / Industrial / Village"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
              <input
                {...register('District')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Namakkal / Pune"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                {...register('State')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Tamil Nadu / Maharashtra"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <input
                {...register('Pincode')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="637001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Tag</label>
              <input
                {...register('Business_Tag')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Poultry Producer / Hatchery"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <input
                {...register('Status')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Active / Operational"
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reviews Count</label>
              <input
                {...register('Reviews')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="24"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Google Maps Link</label>
              <input
                {...register('Maps_Link')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source URL</label>
              <input
                {...register('Source')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Analyst</label>
              <input
                {...register('Analyst')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Analyst Name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Remarks</label>
              <input
                {...register('Notes')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Special notes or certifications"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Single Record Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Poultry Farm Record"
        message={`Are you sure you want to delete "${deletingItem?.Name || deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete Record"
        confirmVariant="danger"
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Poultry Directory"
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
