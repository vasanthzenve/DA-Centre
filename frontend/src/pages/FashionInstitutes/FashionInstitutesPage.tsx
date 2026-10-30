import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, GraduationCap, MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { fashionInstituteService } from '../../services/fashionInstituteService';
import { FashionInstitute, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Institute_Name: z.string().min(1, 'Institute Name is required'),
  state: z.string().optional(),
  City: z.string().optional(),
  Area: z.string().optional(),
  Address: z.string().optional(),
  Pincode: z.string().optional(),
  Phone_No: z.string().optional(),
  Website: z.string().optional(),
  Email_ID: z.string().optional(),
  Map_Location: z.string().optional(),
  Place_ID: z.string().optional(),
  Verification_status: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const FashionInstitutesPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<FashionInstitute> | null>(null);
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
  const [editingItem, setEditingItem] = useState<FashionInstitute | null>(null);
  const [viewingItem, setViewingItem] = useState<FashionInstitute | null>(null);
  const [deletingItem, setDeletingItem] = useState<FashionInstitute | null>(null);
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
      const res = await fashionInstituteService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load fashion institutes directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fashionInstituteService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Institute_Name: '',
      state: '',
      City: '',
      Area: '',
      Address: '',
      Pincode: '',
      Phone_No: '',
      Website: '',
      Email_ID: '',
      Map_Location: '',
      Place_ID: '',
      Verification_status: 'Verified',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: FashionInstitute) => {
    setEditingItem(item);
    reset({
      Institute_Name: item.Institute_Name || item.instituteName || '',
      state: item.state || item.State || '',
      City: item.City || item.city || '',
      Area: item.Area || item.area || '',
      Address: item.Address || item.address || '',
      Pincode: item.Pincode || item.pincode || '',
      Phone_No: item.Phone_No || item.phoneNo || '',
      Website: item.Website || item.website || '',
      Email_ID: item.Email_ID || item.emailId || '',
      Map_Location: item.Map_Location || item.mapLocation || '',
      Place_ID: item.Place_ID || item.placeId || '',
      Verification_status: item.Verification_status || item.verificationStatus || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await fashionInstituteService.update(editingItem.id, values);
        toast.success('Fashion institute updated successfully');
      } else {
        await fashionInstituteService.create(values);
        toast.success('Fashion institute created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving fashion institute');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await fashionInstituteService.delete(deletingItem.id);
      toast.success('Fashion institute deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete fashion institute');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await fashionInstituteService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No institutes found to delete');
          return;
        }
        await fashionInstituteService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} institutes successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await fashionInstituteService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} institutes successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected institutes');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<FashionInstitute>[] = [
    {
      header: 'Institute Name',
      accessor: 'Institute_Name',
      sortable: true,
      sortField: 'instituteName',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[240px]" title={row.Institute_Name || row.instituteName}>
          {row.Institute_Name || row.instituteName || '—'}
        </span>
      ),
    },
    {
      header: 'City / Area',
      accessor: 'City',
      sortable: true,
      sortField: 'city',
      render: (row) => {
        const city = row.City || row.city;
        const area = row.Area || row.area;
        return (
          <div className="flex flex-col text-xs text-slate-700 dark:text-slate-300">
            <span className="font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {city || '—'}
            </span>
            {area && <span className="text-[11px] text-slate-500 dark:text-slate-400">{area}</span>}
          </div>
        );
      },
    },
    {
      header: 'State',
      accessor: 'state',
      sortable: true,
      sortField: 'state',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 whitespace-nowrap">
          {row.state || row.State || '—'}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'Phone_No',
      render: (row) => {
        const phone = row.Phone_No || row.phoneNo;
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
      header: 'Pincode',
      accessor: 'Pincode',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.Pincode || row.pincode || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'Verification_status',
      render: (row) => {
        const status = row.Verification_status || row.verificationStatus;
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
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-700 dark:text-pink-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Fashion Institutes</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Design colleges, fashion universities, textile academies, and campuses</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fashion Institute
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institute name, city, state, area, pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
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
              className="px-2.5 py-1.5 text-xs text-pink-600 dark:text-pink-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<FashionInstitute>
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
          title={viewingItem.Institute_Name || viewingItem.instituteName || 'Fashion Institute'}
          subtitle={`${viewingItem.City || viewingItem.city || ''} • ${viewingItem.state || viewingItem.State || ''}`}
          fields={[
            { label: 'Institute Name', value: viewingItem.Institute_Name || viewingItem.instituteName },
            { label: 'State', value: viewingItem.state || viewingItem.State },
            { label: 'City', value: viewingItem.City || viewingItem.city },
            { label: 'Area', value: viewingItem.Area || viewingItem.area },
            { label: 'Address', value: viewingItem.Address || viewingItem.address },
            { label: 'Pincode', value: viewingItem.Pincode || viewingItem.pincode },
            { label: 'Phone Number', value: viewingItem.Phone_No || viewingItem.phoneNo, isPhone: true },
            { label: 'Email ID', value: viewingItem.Email_ID || viewingItem.emailId },
            { label: 'Website', value: viewingItem.Website || viewingItem.website, isUrl: true },
            { label: 'Google Maps Link', value: viewingItem.Map_Location || viewingItem.mapLocation, isMap: true },
            { label: 'Place ID', value: viewingItem.Place_ID || viewingItem.placeId },
            { label: 'Verification Status', value: viewingItem.Verification_status || viewingItem.verificationStatus },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Fashion Institute' : 'Add Fashion Institute'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institute Name *
              </label>
              <input
                {...register('Institute_Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. National Institute of Fashion Technology (NIFT)"
              />
              {errors.Institute_Name && <p className="text-rose-500 text-[11px] mt-1">{errors.Institute_Name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                {...register('state')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Delhi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                {...register('City')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="New Delhi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Area / Campus</label>
              <input
                {...register('Area')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Hauz Khas"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <input
                {...register('Pincode')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="110016"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                {...register('Phone_No')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="+91 11 2654 2000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
              <input
                {...register('Email_ID')}
                type="email"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="admissions@nift.ac.in"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                {...register('Website')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://nift.ac.in"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Place ID</label>
              <input
                {...register('Place_ID')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="ChIJ... (Google Maps Place ID)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Map Location Link</label>
              <input
                {...register('Map_Location')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Campus Address</label>
              <textarea
                rows={2}
                {...register('Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full campus street address..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Verification Status</label>
              <input
                {...register('Verification_status')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Verified / Recognized / Affiliated"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Institute'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Fashion Institute"
        message={`Are you sure you want to delete "${deletingItem?.Institute_Name || deletingItem?.instituteName}"? This action cannot be undone.`}
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
        moduleName="Fashion Institutes"
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

