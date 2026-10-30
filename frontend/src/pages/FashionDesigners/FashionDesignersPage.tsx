import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, Plus, Trash2, X, Scissors, MapPin, Phone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { DetailDrawer } from '../../components/common/DetailDrawer';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BulkDeleteDialog } from '../../components/common/BulkDeleteDialog';
import { useToast } from '../../components/common/Toast';
import { fashionDesignerService } from '../../services/fashionDesignerService';
import { FashionDesigner, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  Designer_Name: z.string().min(1, 'Designer Name is required'),
  Brand_Name: z.string().optional(),
  Specification: z.string().optional(),
  City: z.string().optional(),
  State: z.string().optional(),
  Country: z.string().optional(),
  Website_Address: z.string().optional(),
  Official_Email: z.string().optional(),
  Mobile_Number: z.string().optional(),
  Pincode: z.string().optional(),
  Studio_Address: z.string().optional(),
  Year_of_Establishment: z.string().optional(),
  'Mobile/website_verification': z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const FashionDesignersPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<PageResponse<FashionDesigner> | null>(null);
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
  const [editingItem, setEditingItem] = useState<FashionDesigner | null>(null);
  const [viewingItem, setViewingItem] = useState<FashionDesigner | null>(null);
  const [deletingItem, setDeletingItem] = useState<FashionDesigner | null>(null);
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
      const res = await fashionDesignerService.getAll({
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
        sort: currentSort,
        ...filters,
      });
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load fashion designers directory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize, currentSort, filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fashionDesignerService.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    reset({
      Designer_Name: '',
      Brand_Name: '',
      Specification: 'Bridal & Couture Wear',
      City: '',
      State: '',
      Country: 'India',
      Website_Address: '',
      Official_Email: '',
      Mobile_Number: '',
      Pincode: '',
      Studio_Address: '',
      Year_of_Establishment: '2015',
      'Mobile/website_verification': 'Verified',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: FashionDesigner) => {
    setEditingItem(item);
    reset({
      Designer_Name: item.Designer_Name || item.designerName || '',
      Brand_Name: item.Brand_Name || item.brandName || '',
      Specification: item.Specification || item.specification || '',
      City: item.City || item.city || '',
      State: item.State || item.state || '',
      Country: item.Country || item.country || '',
      Website_Address: item.Website_Address || item.websiteAddress || '',
      Official_Email: item.Official_Email || item.officialEmail || '',
      Mobile_Number: item.Mobile_Number || item.mobileNumber || '',
      Pincode: item.Pincode || item.pincode || '',
      Studio_Address: item.Studio_Address || item.studioAddress || '',
      Year_of_Establishment: item.Year_of_Establishment || item.yearOfEstablishment || '',
      'Mobile/website_verification': item['Mobile/website_verification'] || item.verificationStatus || '',
    });
    setIsAddEditOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem && editingItem.id) {
        await fashionDesignerService.update(editingItem.id, values);
        toast.success('Fashion designer updated successfully');
      } else {
        await fashionDesignerService.create(values);
        toast.success('Fashion designer created successfully');
      }
      setIsAddEditOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving fashion designer');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingItem.id) return;
    try {
      await fashionDesignerService.delete(deletingItem.id);
      toast.success('Fashion designer deleted successfully');
      setDeletingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete fashion designer');
    }
  };

  const handleBulkDelete = async (idsOverride?: number[], deleteAll = false) => {
    setIsBulkDeleting(true);
    try {
      if (deleteAll || isAllMatchingSelected) {
        const res = await fashionDesignerService.getAll({
          page: 0,
          size: 50000,
          search: debouncedSearch,
          ...filters,
        });
        const allIds = res.content.map((r: any) => r.id!).filter(Boolean);
        if (allIds.length === 0) {
          toast.error('No designers found to delete');
          return;
        }
        await fashionDesignerService.bulkDelete(allIds);
        toast.success(`Deleted all ${allIds.length} designers successfully`);
      } else {
        const targetIds = idsOverride && idsOverride.length > 0 ? idsOverride : selectedIds;
        if (!targetIds || targetIds.length === 0) return;
        await fashionDesignerService.bulkDelete(targetIds);
        toast.success(`Deleted ${targetIds.length} designers successfully`);
      }
      setSelectedIds([]);
      setIsAllMatchingSelected(false);
      setIsBulkDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete selected designers');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: Column<FashionDesigner>[] = [
    {
      header: 'Designer / Brand',
      accessor: 'Designer_Name',
      sortable: true,
      sortField: 'designerName',
      render: (row) => {
        const name = row.Designer_Name || row.designerName;
        const brand = row.Brand_Name || row.brandName;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-[200px]" title={name}>
              {name || '—'}
            </span>
            {brand && <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{brand}</span>}
          </div>
        );
      },
    },
    {
      header: 'Specification',
      accessor: 'Specification',
      sortable: true,
      sortField: 'specification',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
          {row.Specification || row.specification || 'Couture'}
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
      header: 'Contact',
      accessor: 'Mobile_Number',
      render: (row) => {
        const phone = row.Mobile_Number || row.mobileNumber;
        const email = row.Official_Email || row.officialEmail;
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
      header: 'Est. Year',
      accessor: 'Year_of_Establishment',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.Year_of_Establishment || row.yearOfEstablishment || '—'}
        </span>
      ),
    },
    {
      header: 'Verification',
      accessor: 'Mobile/website_verification',
      render: (row) => {
        const status = row['Mobile/website_verification'] || row.verificationStatus;
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
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-700 dark:text-rose-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Fashion Designers</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Couture labels, bridal designers, bespoke ateliers, and fashion studio networks</p>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fashion Designer
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search designer name, brand, city, state, specification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
              className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<FashionDesigner>
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
          title={viewingItem.Designer_Name || viewingItem.designerName || 'Fashion Designer'}
          subtitle={`${viewingItem.Brand_Name || viewingItem.brandName || ''} • ${viewingItem.City || viewingItem.city || ''}`}
          fields={[
            { label: 'Designer Name', value: viewingItem.Designer_Name || viewingItem.designerName },
            { label: 'Brand Name', value: viewingItem.Brand_Name || viewingItem.brandName },
            { label: 'Specification', value: viewingItem.Specification || viewingItem.specification },
            { label: 'City', value: viewingItem.City || viewingItem.city },
            { label: 'State', value: viewingItem.State || viewingItem.state },
            { label: 'Country', value: viewingItem.Country || viewingItem.country },
            { label: 'Studio Address', value: viewingItem.Studio_Address || viewingItem.studioAddress },
            { label: 'Pincode', value: viewingItem.Pincode || viewingItem.pincode },
            { label: 'Mobile Number', value: viewingItem.Mobile_Number || viewingItem.mobileNumber, isPhone: true },
            { label: 'Official Email', value: viewingItem.Official_Email || viewingItem.officialEmail },
            { label: 'Website Address', value: viewingItem.Website_Address || viewingItem.websiteAddress, isUrl: true },
            { label: 'Year of Establishment', value: viewingItem.Year_of_Establishment || viewingItem.yearOfEstablishment },
            { label: 'Verification Status', value: viewingItem['Mobile/website_verification'] || viewingItem.verificationStatus },
          ]}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Fashion Designer' : 'Add Fashion Designer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designer Name *
              </label>
              <input
                {...register('Designer_Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Sabyasachi Mukherjee"
              />
              {errors.Designer_Name && <p className="text-rose-500 text-[11px] mt-1">{errors.Designer_Name.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
              <input
                {...register('Brand_Name')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Sabyasachi Couture"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Specification</label>
              <input
                {...register('Specification')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. Bridal & Haute Couture"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                {...register('City')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Kolkata"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                {...register('State')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="West Bengal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
              <input
                {...register('Country')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="India"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
              <input
                {...register('Pincode')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="700027"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
              <input
                {...register('Mobile_Number')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="+91 98300 12345"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
              <input
                {...register('Official_Email')}
                type="email"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="studio@sabyasachi.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website Address</label>
              <input
                {...register('Website_Address')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="https://sabyasachi.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year of Establishment</label>
              <input
                {...register('Year_of_Establishment')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="1999"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Studio Address</label>
              <textarea
                rows={2}
                {...register('Studio_Address')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Full studio street address..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Verification Status</label>
              <input
                {...register('Mobile/website_verification')}
                type="text"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="Verified / Pending / Website Checked"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Designer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Delete Fashion Designer"
        message={`Are you sure you want to delete "${deletingItem?.Designer_Name || deletingItem?.designerName}"? This action cannot be undone.`}
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
        moduleName="Fashion Designers"
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

