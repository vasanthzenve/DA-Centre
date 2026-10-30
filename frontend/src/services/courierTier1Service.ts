import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, CourierTier1, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const courierTier1Service = {
  getAll: async (params?: FilterParams): Promise<PageResponse<CourierTier1>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<CourierTier1>>>('/courier-tier-1', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<CourierTier1> => {
    const res = await apiClient.get<ApiResponse<CourierTier1>>(`/courier-tier-1/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<CourierTier1>): Promise<CourierTier1> => {
    const res = await apiClient.post<ApiResponse<CourierTier1>>('/courier-tier-1', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CourierTier1>): Promise<CourierTier1> => {
    const res = await apiClient.put<ApiResponse<CourierTier1>>(`/courier-tier-1/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/courier-tier-1/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/courier-tier-1/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/courier-tier-1/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/courier-tier-1/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/courier-tier-1/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/courier-tier-1/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Courier Tier 1.xlsx');
  },
};

