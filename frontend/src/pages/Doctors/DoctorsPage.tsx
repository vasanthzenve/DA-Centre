import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, FileSpreadsheet, Download, Trash2, X, Stethoscope, ExternalLink, MapPin, Clock, DollarSign } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { useToast } from '../../components/common/Toast';
import { doctorService } from '../../services/doctorService';
import { Doctor, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  'Doctor Name': z.string().min(1, 'Doctor Name is required'),
  Qualification: z.string().optional(),
  Specialist: z.string().optional(),
  Experience: z.string().optional(),
  Location: z.string().optional(),
  Hospital: z.string().optional(),
  Address: z.string().optional(),
  Fee: z.coerce.number().optional(),
  'Working hrs': z.string().optional(),
  'Doctor URL': z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const DoctorsPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<Doctor> | null>(null);
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
  const [editingItem, setEditingItem] = useState<Doctor | null>(null);
  const [viewingItem, setViewingItem] = useState<Doctor | null>(null);
  const [deletingItem, setDeletingItem] = useState<Doctor | null>(null);
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
      const res = await doctorService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load doctors directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  const handleCursorNext = useCallback(async () => {
    if (data?.nextCursor != null) {
      setIsLoading(true);
      try {
        const res = await doctorService.getAll({
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
        const res = await doctorService.getAll({
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
    doctorService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      'Doctor Name': '',
      Qualification: '',
      Specialist: 'Small Animal Surgery',
      Experience: '5+ Years',
      Location: '',
      Hospital: '',
      Address: '',
      Fee: undefined,
      'Working hrs': '09:00 AM - 06:00 PM',
      'Doctor URL': '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: Doctor) => {
    setEditingItem(item);
    reset({
      'Doctor Name': item['Doctor Name'] || item.doctorName || '',
      Qualification: item.Qualification || item.qualification || '',
      Specialist: item.Specialist || item.specialist || '',
      Experience: item.Experience || item.experience || '',
      Location: item.Location || item.location || '',
      Hospital: item.Hospital || item.hospital || '',
      Address: item.Address || item.address || '',
      Fee: item.Fee ?? item.fee,
      'Working hrs': item['Working hrs'] || item.workingHours || '',
      'Doctor URL': item['Doctor URL'] || item.doctorUrl || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await doctorService.update(editingItem.id, values);
        toast.success('Doctor updated successfully');
      } else {
        await doctorService.create(values);
        toast.success('Doctor added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await doctorService.delete(deletingItem.id);
      toast.success('Doctor deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await doctorService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No doctors found to delete');
          return;
        }
        await doctorService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} doctors successfully`);
      } else {
        const targetIds = (idsOverride && idsOverride.length > 0) ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await doctorService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} doctors successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete doctors');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<Doctor>[] = [
    {
      header: 'Doctor Name',
      accessor: 'Doctor Name',
      sortable: true,
      sortField: 'doctorName',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold text-xs shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block whitespace-nowrap">
            {row['Doctor Name'] || row.doctorName || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Qualification',
      accessor: 'Qualification',
      sortable: true,
      sortField: 'qualification',
      render: (row) => (
        <span
          className="text-xs text-slate-700 dark:text-slate-300 max-w-[180px] truncate block"
          title={row.Qualification || row.qualification || ''}
        >
          {row.Qualification || row.qualification || '—'}
        </span>
      ),
    },
    {
      header: 'Specialist',
      accessor: 'Specialist',
      sortable: true,
      sortField: 'specialist',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
          {row.Specialist || row.specialist || 'General'}
        </span>
      ),
    },
    {
      header: 'Experience',
      accessor: 'Experience',
      sortable: true,
      sortField: 'experience',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {row.Experience || row.experience || '—'}
        </span>
      ),
    },
    {
      header: 'Location',
      accessor: 'Location',
      sortable: true,
      sortField: 'location',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
          <MapPin className="w-3 h-3 text-slate-400" />
          {row.Location || row.location || '—'}
        </span>
      ),
    },
    {
      header: 'Hospital / Clinic',
      accessor: 'Hospital',
      sortable: true,
      sortField: 'hospital',
      render: (row) => (
        <span
          className="text-xs font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[180px]"
          title={row.Hospital || row.hospital || ''}
        >
          {row.Hospital || row.hospital || '—'}
        </span>
      ),
    },
    {
      header: 'Address',
      accessor: 'Address',
      render: (row) => (
        <span
          className="text-xs text-slate-500 dark:text-slate-400 max-w-[180px] truncate block"
          title={row.Address || row.address || ''}
        >
          {row.Address || row.address || '—'}
        </span>
      ),
    },
    {
      header: 'Consultation Fee',
      accessor: 'Fee',
      sortable: true,
      sortField: 'fee',
      render: (row) => {
        const fee = row.Fee ?? row.fee;
        return fee !== undefined && fee !== null ? (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
            ₹{fee}
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      header: 'Working Hours',
      accessor: 'Working hrs',
      render: (row) => {
        const hrs = row['Working hrs'] || row.workingHours;
        return hrs ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3 text-slate-400" />
            {hrs}
          </span>
        ) : (
          '—'
        );
      },
    },
    {
      header: 'Profile Link',
      render: (row) => {
        const url = row['Doctor URL'] || row.doctorUrl;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Profile
          </a>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Doctor Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified veterinary physicians, surgeons, dermatologists and exotic pet specialists
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            disabled={!data || data.totalElements === 0}
            title="Delete selected rows or bulk delete doctors"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/35 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Doctor
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
              placeholder="Search doctors by name, qualification, specialist, hospital, location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-cyan-500/25"
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

        {/* 5 Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          <select
            value={filters.specialist || ''}
            onChange={(e) => setFilters({ ...filters, specialist: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-cyan-500 truncate"
          >
            <option value="">Specialist (All)</option>
            {filterOptions.specialists?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.location || ''}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-cyan-500 truncate"
          >
            <option value="">Location (All)</option>
            {filterOptions.locations?.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={filters.hospital || ''}
            onChange={(e) => setFilters({ ...filters, hospital: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-cyan-500 truncate"
          >
            <option value="">Hospital (All)</option>
            {filterOptions.hospitals?.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <select
            value={filters.experience || ''}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-cyan-500 truncate"
          >
            <option value="">Experience (All)</option>
            {filterOptions.experiences?.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>

          <select
            value={filters.maxFee || ''}
            onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
            className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-cyan-500 truncate"
          >
            <option value="">Fee (Any)</option>
            <option value="500">Under ₹500</option>
            <option value="1000">Under ₹1,000</option>
            <option value="1500">Under ₹1,500</option>
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
        emptyTitle="No doctors found"
        onAddClick={handleOpenAdd}
      />

      {/* Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Doctor Profile' : 'Add New Doctor'}
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Doctor Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('Doctor Name')}
                placeholder="Dr. Rajesh Kumar"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
              {errors['Doctor Name'] && (
                <span className="text-xs text-rose-500">{String(errors['Doctor Name']?.message || '')}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Qualification
              </label>
              <input
                {...register('Qualification')}
                placeholder="BVSc & AH, MVSc (Surgery)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Specialist
              </label>
              <input
                {...register('Specialist')}
                placeholder="Veterinary Surgery, Ophthalmology"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Experience
              </label>
              <input
                {...register('Experience')}
                placeholder="10+ Years"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Location
              </label>
              <input
                {...register('Location')}
                placeholder="Indiranagar, Bangalore"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Hospital / Clinic Name
              </label>
              <input
                {...register('Hospital')}
                placeholder="Cessna Lifeline Veterinary Hospital"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                {...register('Fee')}
                placeholder="800"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Working Hours
              </label>
              <input
                {...register('Working hrs')}
                placeholder="Mon-Sat: 10:00 AM - 07:00 PM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Doctor Profile URL
              </label>
              <input
                {...register('Doctor URL')}
                placeholder="https://..."
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
                placeholder="Clinic street address, building, landmark"
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
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Drawer */}
      {viewingItem && (
        <DetailDrawer
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={viewingItem['Doctor Name'] || viewingItem.doctorName || 'Doctor'}
          subtitle={viewingItem.Qualification || viewingItem.qualification}
          fields={[
            { label: 'Doctor Name', value: viewingItem['Doctor Name'] || viewingItem.doctorName },
            { label: 'Qualification', value: viewingItem.Qualification || viewingItem.qualification },
            { label: 'Specialist', value: viewingItem.Specialist || viewingItem.specialist },
            { label: 'Experience', value: viewingItem.Experience || viewingItem.experience },
            { label: 'Location', value: viewingItem.Location || viewingItem.location },
            { label: 'Hospital', value: viewingItem.Hospital || viewingItem.hospital },
            {
              label: 'Fee',
              value: (viewingItem.Fee ?? viewingItem.fee) ? `₹${viewingItem.Fee ?? viewingItem.fee}` : '—',
            },
            { label: 'Working Hours', value: viewingItem['Working hrs'] || viewingItem.workingHours },
            {
              label: 'Doctor URL',
              value: viewingItem['Doctor URL'] || viewingItem.doctorUrl,
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
        title="Delete Doctor"
        message={`Are you sure you want to delete ${deletingItem?.['Doctor Name'] || deletingItem?.doctorName}?`}
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Doctors"
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
        moduleName="Doctors"
        onPreview={(f) => doctorService.previewExcel(f)}
        onConfirm={(r) => doctorService.confirmImport(r)}
        onSuccess={fetchData}
      />

      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        moduleName="Doctors"
        totalCount={data?.totalElements || 0}
        filteredCount={data?.totalElements || 0}
        selectedCount={selectedIds.length}
        onExport={async (req) => {
          await doctorService.exportExcel({
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
