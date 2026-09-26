import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, Star, ExternalLink, Phone, MapPin } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { serviceNetworkService } from '../../services/serviceNetworkService';
import { ServiceNetwork, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Business Name': z.string().min(1, 'Business Name is required'),
  'Service Type': z.string().optional(),
  State: z.string().optional(),
  'District / Region': z.string().optional(),
  Area: z.string().optional(),
  Address: z.string().optional(),
  'City / Region': z.string().optional(),
  'Contact Number': z.string().optional(),
  'Website / Social Media': z.string().optional(),
  Rating: z.coerce.number().optional(),
  'Google Maps / Source URL': z.string().optional(),
  'Booking URL / Booking Contact': z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ServiceNetworkPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<ServiceNetwork> | null>(null);
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
  const [editingItem, setEditingItem] = useState<ServiceNetwork | null>(null);
  const [viewingItem, setViewingItem] = useState<ServiceNetwork | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceNetwork | null>(null);
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
      const res = await serviceNetworkService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load service network');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await serviceNetworkService.getAll({
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
        const res = await serviceNetworkService.getAll({
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
    serviceNetworkService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Business Name': '',
      'Service Type': 'Mobile Pet Grooming',
      State: '',
      'District / Region': '',
      Area: '',
      Address: '',
      'City / Region': '',
      'Contact Number': '',
      'Website / Social Media': '',
      Rating: undefined,
      'Google Maps / Source URL': '',
      'Booking URL / Booking Contact': '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: ServiceNetwork) => {
    setEditingItem(item);
    reset({
      'Business Name': item['Business Name'] || item.businessName || '',
      'Service Type': item['Service Type'] || item.serviceType || '',
      State: item.State || item.state || '',
      'District / Region': item['District / Region'] || item.districtRegion || '',
      Area: item.Area || item.area || '',
      Address: item.Address || item.address || '',
      'City / Region': item['City / Region'] || item.cityRegion || '',
      'Contact Number': item['Contact Number'] || item.contactNumber || '',
      'Website / Social Media': item['Website / Social Media'] || item.websiteSocialMedia || '',
      Rating: item.Rating ?? item.rating,
      'Google Maps / Source URL': item['Google Maps / Source URL'] || item.googleMapsSourceUrl || '',
      'Booking URL / Booking Contact': item['Booking URL / Booking Contact'] || item.bookingUrlContact || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await serviceNetworkService.update(editingItem.id, values);
        toast.success('Service updated successfully');
      } else {
        await serviceNetworkService.create(values);
        toast.success('Service added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving service');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await serviceNetworkService.delete(deletingItem.id);
      toast.success('Service deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete service');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await serviceNetworkService.bulkDelete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} services successfully`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete services');
    }
  };

  const columns: Column<ServiceNetwork>[] = [
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
            {row['Service Type'] || row.serviceType || 'Service'}
          </span>
        </div>
      ),
    },
    {
      header: 'City / Region',
      accessor: 'City / Region',
      render: (row) => row['City / Region'] || row.cityRegion || '—',
    },
    {
      header: 'State',
      accessor: 'State',
      sortable: true,
      sortField: 'state',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {row.State || row.state || '—'}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'Contact Number',
      render: (row) => {
        const ph = row['Contact Number'] || row.contactNumber;
        return ph ? (
          <a href={`tel:${ph}`} className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
            <Phone className="w-3 h-3" />
            {ph}
          </a>
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
          </div>
        ) : '—';
      },
    },
    {
      header: 'Links',
      render: (row) => {
        const web = row['Website / Social Media'] || row.websiteSocialMedia;
        const map = row['Google Maps / Source URL'] || row.googleMapsSourceUrl;
        const book = row['Booking URL / Booking Contact'] || row.bookingUrlContact;
        return (
          <div className="flex items-center gap-2">
            {web && (
              <a href={web} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                <ExternalLink className="w-3 h-3" /> Web
              </a>
            )}
            {map && (
              <a href={map} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> Map
              </a>
            )}
            {book && (
              <a href={book.startsWith('http') ? book : `tel:${book}`} target="_blank" rel="noreferrer" className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5">
                <ExternalLink className="w-3 h-3" /> Book
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
            Service Network
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Directory of pet ambulances, mobile grooming vans, luxury boarding &amp; daycare centers
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
            Add Service
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
              placeholder="Search services by business name, service type, state, district, city, contact..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* 7 Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          <select
            value={filters.businessName || ''}
            onChange={(e) => setFilters({ ...filters, businessName: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Business (All)</option>
            {filterOptions.businessNames?.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            value={filters.serviceType || ''}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Service Type</option>
            {filterOptions.serviceTypes?.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filters.state || ''}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">State (All)</option>
            {filterOptions.states?.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>

          <select
            value={filters.districtRegion || ''}
            onChange={(e) => setFilters({ ...filters, districtRegion: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">District/Region</option>
            {filterOptions.districtRegions?.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={filters.area || ''}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Area (All)</option>
            {filterOptions.areas?.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <select
            value={filters.cityRegion || ''}
            onChange={(e) => setFilters({ ...filters, cityRegion: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">City/Region</option>
            {filterOptions.cityRegions?.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
          </select>

          <select
            value={filters.rating || ''}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Rating (All)</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
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
        emptyTitle="No service network providers found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Service' : 'Add Service Provider'}
        maxWidth="3xl"
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Service Type</label>
              <input {...register('Service Type')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">State</label>
              <input {...register('State')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">District / Region</label>
              <input {...register('District / Region')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Area</label>
              <input {...register('Area')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">City / Region</label>
              <input {...register('City / Region')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Contact Number</label>
              <input {...register('Contact Number')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Website / Social Media</label>
              <input {...register('Website / Social Media')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" {...register('Rating')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Google Maps / Source URL</label>
              <input {...register('Google Maps / Source URL')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Booking URL / Booking Contact</label>
              <input {...register('Booking URL / Booking Contact')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Business Name'] || viewingItem.businessName || 'Service'}
          subtitle={viewingItem['Service Type'] || viewingItem.serviceType}
          fields={[
            { label: 'Business Name', value: viewingItem['Business Name'] || viewingItem.businessName },
            { label: 'Service Type', value: viewingItem['Service Type'] || viewingItem.serviceType },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'District / Region', value: viewingItem['District / Region'] || viewingItem.districtRegion },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'City / Region', value: viewingItem['City / Region'] || viewingItem.cityRegion },
            { label: 'Contact Number', value: viewingItem['Contact Number'] || viewingItem.contactNumber, isPhone: true },
            { label: 'Website / Social Media', value: viewingItem['Website / Social Media'] || viewingItem.websiteSocialMedia, isUrl: true },
            { label: 'Rating', value: viewingItem.Rating ?? viewingItem.rating, isRating: true },
            { label: 'Google Maps / Source URL', value: viewingItem['Google Maps / Source URL'] || viewingItem.googleMapsSourceUrl, isMap: true },
            { label: 'Booking URL / Booking Contact', value: viewingItem['Booking URL / Booking Contact'] || viewingItem.bookingUrlContact, isUrl: true },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Service Provider"
        message={`Are you sure you want to delete ${deletingItem?.['Business Name'] || deletingItem?.businessName}?`}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Services"
        message={`Are you sure you want to delete ${selectedIds.length} selected services?`}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleName="Service Network"
        onPreview={(f) => serviceNetworkService.previewExcel(f)}
        onConfirm={(r) => serviceNetworkService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Service Network"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await serviceNetworkService.exportExcel({
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
