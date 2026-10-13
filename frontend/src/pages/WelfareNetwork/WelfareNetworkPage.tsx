import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, Star, HeartHandshake, ExternalLink, Phone, MapPin } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { welfareNetworkService } from '../../services/welfareNetworkService';
import { WelfareNetwork, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Business Name': z.string().min(1, 'Business / NGO Name is required'),
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

export const WelfareNetworkPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<WelfareNetwork> | null>(null);
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
  const [editingItem, setEditingItem] = useState<WelfareNetwork | null>(null);
  const [viewingItem, setViewingItem] = useState<WelfareNetwork | null>(null);
  const [deletingItem, setDeletingItem] = useState<WelfareNetwork | null>(null);
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
      const res = await welfareNetworkService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load welfare organizations');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await welfareNetworkService.getAll({
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
        const res = await welfareNetworkService.getAll({
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
    welfareNetworkService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Business Name': '',
      'Service Type': 'Animal Shelter & Rescue',
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

  const handleOpenEdit = (item: WelfareNetwork) => {
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
        await welfareNetworkService.update(editingItem.id, values);
        toast.success('Welfare organization updated successfully');
      } else {
        await welfareNetworkService.create(values);
        toast.success('Welfare organization added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving welfare organization');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await welfareNetworkService.delete(deletingItem.id);
      toast.success('Welfare organization deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete welfare organization');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await welfareNetworkService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No organizations found to delete');
          return;
        }
        await welfareNetworkService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} organizations successfully`);
      } else {
        const targetIds = (idsOverride && idsOverride.length > 0) ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await welfareNetworkService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} organizations successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete organizations');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<WelfareNetwork>[] = [
    {
      header: 'Organization / NGO',
      accessor: 'Business Name',
      sortable: true,
      sortField: 'businessName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              {row['Business Name'] || row.businessName}
            </span>
            <span className="text-xs text-slate-400">
              {row['Service Type'] || row.serviceType || 'Animal Shelter'}
            </span>
          </div>
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
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
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
          <a
            href={`tel:${ph}`}
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <Phone className="w-3 h-3" />
            {ph}
          </a>
        ) : (
          '—'
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
          </div>
        ) : (
          '—'
        );
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
              <a
                href={web}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
              >
                <ExternalLink className="w-3 h-3" /> Web
              </a>
            )}
            {map && (
              <a
                href={map}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <MapPin className="w-3 h-3" /> Map
              </a>
            )}
            {book && (
              <a
                href={book.startsWith('http') ? book : `tel:${book}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <ExternalLink className="w-3 h-3" /> Adopt/Donate
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
            Animal Welfare Network
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified animal shelters, adoption centers, rescue NGOs, foster homes &amp; animal birth control centers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete organizations"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/35 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Organization
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
              placeholder="Search NGOs by name, service type, state, district, city, contact..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-pink-500/25"
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
              className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* 6 Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <select
            value={filters.businessName || ''}
            onChange={(e) => setFilters({ ...filters, businessName: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
          >
            <option value="">NGO (All)</option>
            {filterOptions.businessNames?.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={filters.serviceType || ''}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
          >
            <option value="">Service Type</option>
            {filterOptions.serviceTypes?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.state || ''}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
          >
            <option value="">State (All)</option>
            {filterOptions.states?.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={filters.districtRegion || ''}
            onChange={(e) => setFilters({ ...filters, districtRegion: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
          >
            <option value="">District/Region</option>
            {filterOptions.districtRegions?.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filters.cityRegion || ''}
            onChange={(e) => setFilters({ ...filters, cityRegion: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
          >
            <option value="">City/Region</option>
            {filterOptions.cityRegions?.map((cr) => (
              <option key={cr} value={cr}>
                {cr}
              </option>
            ))}
          </select>

          <select
            value={filters.rating || ''}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-rose-500 truncate"
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
        emptyTitle="No animal welfare organizations found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Welfare Organization' : 'Add Welfare Organization'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Organization / NGO Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('Business Name')}
                placeholder="Blue Cross of India"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
              {errors['Business Name'] && (
                <span className="text-xs text-rose-500">{String(errors['Business Name']?.message || '')}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Service Type
              </label>
              <input
                {...register('Service Type')}
                placeholder="Shelter, Rescue & ABC"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                State
              </label>
              <input
                {...register('State')}
                placeholder="Tamil Nadu"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                District / Region
              </label>
              <input
                {...register('District / Region')}
                placeholder="Chennai District"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Area
              </label>
              <input
                {...register('Area')}
                placeholder="Guindy"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                City / Region
              </label>
              <input
                {...register('City / Region')}
                placeholder="Chennai"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Contact Number
              </label>
              <input
                {...register('Contact Number')}
                placeholder="+91 44 2235 4980"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Website / Social Media
              </label>
              <input
                {...register('Website / Social Media')}
                placeholder="https://bluecrossofindia.org"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('Rating')}
                placeholder="4.8"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Google Maps / Source URL
              </label>
              <input
                {...register('Google Maps / Source URL')}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Booking URL / Donation Link
              </label>
              <input
                {...register('Booking URL / Booking Contact')}
                placeholder="https://bluecrossofindia.org/donate"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Address
              </label>
              <textarea
                rows={2}
                {...register('Address')}
                placeholder="Complete street address of the shelter"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Organization'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Business Name'] || viewingItem.businessName || 'Organization'}
          subtitle={viewingItem['Service Type'] || viewingItem.serviceType}
          fields={[
            { label: 'Organization Name', value: viewingItem['Business Name'] || viewingItem.businessName },
            { label: 'Service Type', value: viewingItem['Service Type'] || viewingItem.serviceType },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'District / Region', value: viewingItem['District / Region'] || viewingItem.districtRegion },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'City / Region', value: viewingItem['City / Region'] || viewingItem.cityRegion },
            { label: 'Contact Number', value: viewingItem['Contact Number'] || viewingItem.contactNumber, isPhone: true },
            {
              label: 'Website / Social Media',
              value: viewingItem['Website / Social Media'] || viewingItem.websiteSocialMedia,
              isUrl: true,
            },
            { label: 'Rating', value: viewingItem.Rating ?? viewingItem.rating, isRating: true },
            {
              label: 'Google Maps / Source URL',
              value: viewingItem['Google Maps / Source URL'] || viewingItem.googleMapsSourceUrl,
              isMap: true,
            },
            {
              label: 'Booking URL / Donation Link',
              value: viewingItem['Booking URL / Booking Contact'] || viewingItem.bookingUrlContact,
              isUrl: true,
            },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Welfare Organization"
        message={`Are you sure you want to delete ${deletingItem?.['Business Name'] || deletingItem?.businessName}?`}
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Welfare Organizations"
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
        moduleName="Welfare Network"
        onPreview={(f) => welfareNetworkService.previewExcel(f)}
        onConfirm={(r) => welfareNetworkService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Welfare Network"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await welfareNetworkService.exportExcel({
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
