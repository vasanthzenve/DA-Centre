import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  X,
  Star,
  ExternalLink,
  Phone,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { veterinaryEcosystemService } from '../../services/veterinaryEcosystemService';
import { VeterinaryEcosystem, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Hospital Name': z.string().min(1, 'Hospital Name is required'),
  State: z.string().optional(),
  City: z.string().optional(),
  Area: z.string().optional(),
  Address: z.string().optional(),
  'Phone Number': z.string().optional(),
  Website: z.string().optional(),
  'Opening Hours': z.string().optional(),
  Rating: z.coerce.number().optional(),
  Reviews: z.coerce.number().optional(),
  'Business Status': z.string().optional(),
  'Google Maps': z.string().optional(),
  'Place ID': z.string().optional(),
  Service: z.string().optional(),
  'Online Verification': z.string().optional(),
  Comment: z.string().optional(),
  'Fashion supply': z.string().optional(),
  Analyst: z.string().optional(),
  Date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const VeterinaryEcosystemPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<VeterinaryEcosystem> | null>(null);
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
  const [editingItem, setEditingItem] = useState<VeterinaryEcosystem | null>(null);
  const [viewingItem, setViewingItem] = useState<VeterinaryEcosystem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VeterinaryEcosystem | null>(null);
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
      const res = await veterinaryEcosystemService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load veterinary hospitals');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await veterinaryEcosystemService.getAll({
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
        const res = await veterinaryEcosystemService.getAll({
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
    veterinaryEcosystemService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Hospital Name': '',
      State: '',
      City: '',
      Area: '',
      Address: '',
      'Phone Number': '',
      Website: '',
      'Opening Hours': '',
      Rating: undefined,
      Reviews: undefined,
      'Business Status': 'Active',
      'Google Maps': '',
      'Place ID': '',
      Service: '',
      'Online Verification': 'Verified',
      Comment: '',
      'Fashion supply': 'No',
      Analyst: '',
      Date: new Date().toISOString().split('T')[0],
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: VeterinaryEcosystem) => {
    setEditingItem(item);
    reset({
      'Hospital Name': item['Hospital Name'] || item.hospitalName || '',
      State: item.State || item.state || '',
      City: item.City || item.city || '',
      Area: item.Area || item.area || '',
      Address: item.Address || item.address || '',
      'Phone Number': item['Phone Number'] || item.phoneNumber || '',
      Website: item.Website || item.website || '',
      'Opening Hours': item['Opening Hours'] || item.openingHours || '',
      Rating: item.Rating ?? item.rating,
      Reviews: item.Reviews ?? item.reviews,
      'Business Status': item['Business Status'] || item.businessStatus || 'Active',
      'Google Maps': item['Google Maps'] || item.googleMaps || '',
      'Place ID': item['Place ID'] || item.placeId || '',
      Service: item.Service || item.service || '',
      'Online Verification': item['Online Verification'] || item.onlineVerification || 'Verified',
      Comment: item.Comment || item.comment || '',
      'Fashion supply': item['Fashion supply'] || item.fashionSupply || 'No',
      Analyst: item.Analyst || item.analyst || '',
      Date: item.Date || item.date || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await veterinaryEcosystemService.update(editingItem.id, values);
        toast.success('Hospital updated successfully');
      } else {
        await veterinaryEcosystemService.create(values);
        toast.success('Hospital added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving hospital');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await veterinaryEcosystemService.delete(deletingItem.id);
      toast.success('Hospital deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete hospital');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await veterinaryEcosystemService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No hospitals found to delete');
          return;
        }
        await veterinaryEcosystemService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} hospitals successfully`);
      } else {
        const targetIds = (idsOverride && idsOverride.length > 0) ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await veterinaryEcosystemService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} hospitals successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete hospitals');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<VeterinaryEcosystem>[] = [
    {
      header: 'Hospital Name',
      accessor: 'Hospital Name',
      sortable: true,
      sortField: 'hospitalName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {row['Hospital Name'] || row.hospitalName}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            {row.Website || row.website ? (
              <a
                href={row.Website || row.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Website
              </a>
            ) : null}
            {row['Google Maps'] || row.googleMaps ? (
              <a
                href={row['Google Maps'] || row.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" /> Maps
              </a>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      header: 'City',
      accessor: 'City',
      sortable: true,
      sortField: 'city',
      render: (row) => row.City || row.city || '—',
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
      header: 'Phone Number',
      accessor: 'Phone Number',
      render: (row) => {
        const ph = row['Phone Number'] || row.phoneNumber;
        if (!ph) return '—';
        return (
          <a
            href={`tel:${ph}`}
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <Phone className="w-3 h-3" />
            {ph}
          </a>
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
        if (!r) return '—';
        return (
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{r}</span>
            <span className="text-slate-400 font-normal">({row.Reviews ?? row.reviews ?? 0})</span>
          </div>
        );
      },
    },
    {
      header: 'Business Status',
      accessor: 'Business Status',
      render: (row) => {
        const status = row['Business Status'] || row.businessStatus || 'Active';
        const isAct = status.toLowerCase() === 'active';
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
              isAct
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: 'Verification',
      accessor: 'Online Verification',
      render: (row) => {
        const ver = row['Online Verification'] || row.onlineVerification || 'Pending';
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            {ver}
          </span>
        );
      },
    },
    {
      header: 'Analyst',
      accessor: 'Analyst',
      render: (row) => row.Analyst || row.analyst || '—',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Veterinary Ecosystem
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic directory of veterinary hospitals, clinics, specialists &amp; clinical status
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete hospitals"
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
            Add Hospital
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
              placeholder="Search hospitals by name, city, state, area, services, analyst, phone..."
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

        {/* 8 Filters matching requirements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
          {/* State */}
          <select
            value={filters.state || ''}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">State (All)</option>
            {filterOptions.states?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">City (All)</option>
            {filterOptions.cities?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Area */}
          <select
            value={filters.area || ''}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Area (All)</option>
            {filterOptions.areas?.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Business Status */}
          <select
            value={filters.businessStatus || ''}
            onChange={(e) => setFilters({ ...filters, businessStatus: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Status (All)</option>
            {filterOptions.businessStatuses?.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Rating */}
          <select
            value={filters.rating || ''}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Rating (All)</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
          </select>

          {/* Service */}
          <select
            value={filters.service || ''}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Service (All)</option>
            {filterOptions.services?.map((sv) => (
              <option key={sv} value={sv}>{sv}</option>
            ))}
          </select>

          {/* Online Verification */}
          <select
            value={filters.onlineVerification || ''}
            onChange={(e) => setFilters({ ...filters, onlineVerification: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Verified (All)</option>
            {filterOptions.onlineVerifications?.map((ov) => (
              <option key={ov} value={ov}>{ov}</option>
            ))}
          </select>

          {/* Analyst */}
          <select
            value={filters.analyst || ''}
            onChange={(e) => setFilters({ ...filters, analyst: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
          >
            <option value="">Analyst (All)</option>
            {filterOptions.analysts?.map((an) => (
              <option key={an} value={an}>{an}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
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
        emptyTitle="No veterinary hospitals found"
        emptyDescription="Add a hospital manually or import via Excel."
        onAddClick={handleOpenAdd}
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Veterinary Hospital' : 'Add Veterinary Hospital'}
        subtitle="Fill all required clinical metadata"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Hospital Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('Hospital Name')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Madras Veterinary College Hospital"
              />
              {errors['Hospital Name'] && (
                <span className="text-xs text-rose-500">{String(errors['Hospital Name']?.message || '')}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                State
              </label>
              <input
                {...register('State')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Tamil Nadu"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                City
              </label>
              <input
                {...register('City')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Chennai"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Area
              </label>
              <input
                {...register('Area')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. Vepery"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Phone Number
              </label>
              <input
                {...register('Phone Number')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. +91-44-25304000"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Website
              </label>
              <input
                {...register('Website')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Opening Hours
              </label>
              <input
                {...register('Opening Hours')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="e.g. 24 Hours or 09:00 AM - 09:00 PM"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Rating (0.0 to 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('Rating')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="4.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Reviews
              </label>
              <input
                type="number"
                {...register('Reviews')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="320"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Business Status
              </label>
              <select
                {...register('Business Status')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Temporarily Closed">Temporarily Closed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Online Verification
              </label>
              <select
                {...register('Online Verification')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Google Maps URL
              </label>
              <input
                {...register('Google Maps')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Place ID
              </label>
              <input
                {...register('Place ID')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="ChIJ..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Service
              </label>
              <input
                {...register('Service')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="Surgery, ICU, X-Ray..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Fashion supply
              </label>
              <select
                {...register('Fashion supply')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Analyst
              </label>
              <input
                {...register('Analyst')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="Analyst Name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Date
              </label>
              <input
                type="date"
                {...register('Date')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Address
              </label>
              <textarea
                rows={2}
                {...register('Address')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="Full clinical address..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Comment
              </label>
              <textarea
                rows={2}
                {...register('Comment')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100"
                placeholder="Clinical observations or remarks..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Hospital'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Hospital Name'] || viewingItem.hospitalName || 'Hospital'}
          subtitle={`${viewingItem.City || viewingItem.city || ''}, ${viewingItem.State || viewingItem.state || ''}`}
          fields={[
            { label: 'Hospital Name', value: viewingItem['Hospital Name'] || viewingItem.hospitalName },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'City', value: viewingItem.City || viewingItem.city },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'Phone Number', value: viewingItem['Phone Number'] || viewingItem.phoneNumber, isPhone: true },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Google Maps', value: viewingItem['Google Maps'] || viewingItem.googleMaps, isMap: true },
            { label: 'Place ID', value: viewingItem['Place ID'] || viewingItem.placeId },
            { label: 'Opening Hours', value: viewingItem['Opening Hours'] || viewingItem.openingHours },
            { label: 'Rating', value: viewingItem.Rating ?? viewingItem.rating, isRating: true },
            { label: 'Reviews', value: viewingItem.Reviews ?? viewingItem.reviews },
            { label: 'Business Status', value: viewingItem['Business Status'] || viewingItem.businessStatus },
            { label: 'Online Verification', value: viewingItem['Online Verification'] || viewingItem.onlineVerification },
            { label: 'Service', value: viewingItem.Service || viewingItem.service },
            { label: 'Fashion supply', value: viewingItem['Fashion supply'] || viewingItem.fashionSupply },
            { label: 'Analyst', value: viewingItem.Analyst || viewingItem.analyst },
            { label: 'Date', value: viewingItem.Date || viewingItem.date },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
            { label: 'Comment', value: viewingItem.Comment || viewingItem.comment },
          ]}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Hospital"
        message={`Are you sure you want to delete ${deletingItem?.['Hospital Name'] || deletingItem?.hospitalName}? This action cannot be undone.`}
      />

      {/* Bulk Delete */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Veterinary Hospitals"
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

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleName="Veterinary Ecosystem"
        onPreview={(file) => veterinaryEcosystemService.previewExcel(file)}
        onConfirm={(rows) => veterinaryEcosystemService.confirmImport(rows)}
        onSuccess={fetchData}
      />

      {/* Excel Export Modal */}
      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Veterinary Ecosystem"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await veterinaryEcosystemService.exportExcel({
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
