import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, TestTube, MapPin, Phone, Mail, Globe, Map } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { humanPetLabService } from '../../services/humanPetLabService';
import { HumanPetLab, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Laboratory_Name: z.string().min(1, 'Laboratory Name is required'),
  State: z.string().optional(),
  City: z.string().optional(),
  Laboratory_Address: z.string().optional(),
  Contact_Number: z.string().optional(),
  Email_ID: z.string().optional(),
  Laboratory_Type: z.string().optional(),
  Testing_Services: z.string().optional(),
  'Animal_Types_Covered_(N/A_for_Human_Labs)': z.string().optional(),
  website: z.string().optional(),
  Google_Maps_Link: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const HumanPetLabsPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<HumanPetLab> | null>(null);
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
  const [editingItem, setEditingItem] = useState<HumanPetLab | null>(null);
  const [viewingItem, setViewingItem] = useState<HumanPetLab | null>(null);
  const [deletingItem, setDeletingItem] = useState<HumanPetLab | null>(null);
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
      const res = await humanPetLabService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load laboratories directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    humanPetLabService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Laboratory_Name: '',
      State: '',
      City: '',
      Laboratory_Address: '',
      Contact_Number: '',
      Email_ID: '',
      Laboratory_Type: 'Veterinary / Pet Lab',
      Testing_Services: 'Hematology, Biochemistry, Pathology, Microbiology',
      'Animal_Types_Covered_(N/A_for_Human_Labs)': 'Canine, Feline, Equine, Bovine',
      website: '',
      Google_Maps_Link: '',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: HumanPetLab) => {
    setEditingItem(item);
    reset({
      Laboratory_Name: item.Laboratory_Name || item.laboratoryName || '',
      State: item.State || item.state || '',
      City: item.City || item.city || '',
      Laboratory_Address: item.Laboratory_Address || item.laboratoryAddress || '',
      Contact_Number: item.Contact_Number || item.contactNumber || '',
      Email_ID: item.Email_ID || item.emailId || '',
      Laboratory_Type: item.Laboratory_Type || item.laboratoryType || '',
      Testing_Services: item.Testing_Services || item.testingServices || '',
      'Animal_Types_Covered_(N/A_for_Human_Labs)': item['Animal_Types_Covered_(N/A_for_Human_Labs)'] || item.animalTypesCovered || '',
      website: item.website || '',
      Google_Maps_Link: item.Google_Maps_Link || item.googleMapsLink || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await humanPetLabService.update(editingItem.id, values);
        toast.success('Laboratory updated successfully');
      } else {
        await humanPetLabService.create(values);
        toast.success('Laboratory added successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving laboratory');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await humanPetLabService.delete(deletingItem.id);
      toast.success('Laboratory deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete laboratory');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await humanPetLabService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No labs found to delete');
          return;
        }
        await humanPetLabService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} labs successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await humanPetLabService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} labs successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected labs');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<HumanPetLab>[] = [
    {
      header: 'Laboratory Name',
      accessor: 'Laboratory_Name',
      sortable: true,
      sortField: 'laboratoryName',
      render: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[220px]" title={row.Laboratory_Name || row.laboratoryName}>
          {row.Laboratory_Name || row.laboratoryName || '—'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'Laboratory_Type',
      sortable: true,
      sortField: 'laboratoryType',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 whitespace-nowrap">
          {row.Laboratory_Type || row.laboratoryType || 'General'}
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
      header: 'Testing Services',
      accessor: 'Testing_Services',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[200px] truncate block" title={row.Testing_Services || row.testingServices}>
          {row.Testing_Services || row.testingServices || '—'}
        </span>
      ),
    },
    {
      header: 'Animal Types',
      accessor: 'Animal_Types_Covered_(N/A_for_Human_Labs)',
      render: (row) => {
        const val = row['Animal_Types_Covered_(N/A_for_Human_Labs)'] || row.animalTypesCovered;
        return (
          <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[160px] truncate block" title={val}>
            {val || '—'}
          </span>
        );
      },
    },
    {
      header: 'Contact',
      accessor: 'Contact_Number',
      render: (row) => {
        const phone = row.Contact_Number || row.contactNumber;
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
      header: 'Links',
      accessor: 'website',
      render: (row) => {
        const site = row.website;
        const map = row.Google_Maps_Link || row.googleMapsLink;
        return (
          <div className="flex items-center gap-2">
            {site && (
              <a href={site} target="_blank" rel="noreferrer" className="text-violet-600 hover:text-violet-700 dark:text-violet-400" title="Visit Website">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            {map && (
              <a href={map} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400" title="View on Map">
                <Map className="w-3.5 h-3.5" />
              </a>
            )}
            {!site && !map && '—'}
          </div>
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
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
              <TestTube className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Human & Pet Labs</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Clinical pathology, veterinary diagnostics, and testing centers</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Laboratory
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search laboratory, type, city, state, testing services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.laboratoryTypes && filterOptions.laboratoryTypes.length > 0 && (
            <select
              value={filters.laboratoryType || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, laboratoryType: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">All Types</option>
              {filterOptions.laboratoryTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {filterOptions.states && filterOptions.states.length > 0 && (
            <select
              value={filters.state || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">All States</option>
              {filterOptions.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {filterOptions.cities && filterOptions.cities.length > 0 && (
            <select
              value={filters.city || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="px-2.5 py-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
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
          title={viewingItem.Laboratory_Name || viewingItem.laboratoryName || 'Laboratory'}
          subtitle={viewingItem.Laboratory_Type || viewingItem.laboratoryType}
          fields={[
            { label: 'Laboratory Name', value: viewingItem.Laboratory_Name || viewingItem.laboratoryName },
            { label: 'Laboratory Type', value: viewingItem.Laboratory_Type || viewingItem.laboratoryType },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'City', value: viewingItem.City || viewingItem.city },
            { label: 'Address', value: viewingItem.Laboratory_Address || viewingItem.laboratoryAddress },
            { label: 'Contact Number', value: viewingItem.Contact_Number || viewingItem.contactNumber, isPhone: true },
            { label: 'Email ID', value: viewingItem.Email_ID || viewingItem.emailId },
            { label: 'Testing Services', value: viewingItem.Testing_Services || viewingItem.testingServices },
            { label: 'Animal Types Covered', value: viewingItem['Animal_Types_Covered_(N/A_for_Human_Labs)'] || viewingItem.animalTypesCovered },
            { label: 'Website', value: viewingItem.website, isUrl: true },
            { label: 'Google Maps Link', value: viewingItem.Google_Maps_Link || viewingItem.googleMapsLink, isMap: true },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Laboratory' : 'Add Laboratory'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Laboratory Name <span className="text-violet-500">*</span>
              </label>
              <input
                type="text"
                {...register('Laboratory_Name')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Anand Diagnostic Laboratory / VetPath"
              />
              {errors.Laboratory_Name && (
                <p className="text-[11px] text-violet-500 mt-1">{errors.Laboratory_Name.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Laboratory Type</label>
              <select
                {...register('Laboratory_Type')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Veterinary / Pet Lab">Veterinary / Pet Lab</option>
                <option value="Human Lab">Human Lab</option>
                <option value="Dual Testing Facility">Dual Testing Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                {...register('State')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Karnataka"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                {...register('City')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Bengaluru"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input
                type="text"
                {...register('Contact_Number')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. +91 80 2558 0000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email ID</label>
              <input
                type="email"
                {...register('Email_ID')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. reports@vetpathlab.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Testing Services</label>
              <input
                type="text"
                {...register('Testing_Services')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Complete Blood Count, Urine Analysis, Histopathology, PCR, X-Ray"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Animal Types Covered (N/A for Human Labs)
              </label>
              <input
                type="text"
                {...register('Animal_Types_Covered_(N/A_for_Human_Labs)')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Canine, Feline, Avian, Bovine (or N/A)"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input
                type="text"
                {...register('website')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. https://www.vetpathlab.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Google Maps Link</label>
              <input
                type="text"
                {...register('Google_Maps_Link')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. https://maps.google.com/..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Laboratory Address</label>
              <textarea
                rows={2}
                {...register('Laboratory_Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full street and building address..."
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
              className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Laboratory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Laboratory"
        message={`Are you sure you want to delete ${deletingItem?.Laboratory_Name || deletingItem?.laboratoryName}? This action cannot be undone.`}
      />

      {/* Bulk Delete */}
      <BulkDeleteDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedCount={isAllMatchingSelected ? (data?.totalElements || 0) : selectedIds.length}
        currentPageCount={data?.content?.length || 0}
        totalElements={data?.totalElements}
        moduleName="Human & Pet Labs"
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

