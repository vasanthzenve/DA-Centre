import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, Livestock, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const livestockService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<Livestock>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Livestock>>>('/livestock', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<Livestock> => {
    const res = await apiClient.get<ApiResponse<Livestock>>(`/livestock/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Livestock>): Promise<Livestock> => {
    const res = await apiClient.post<ApiResponse<Livestock>>('/livestock', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Livestock>): Promise<Livestock> => {
    const res = await apiClient.put<ApiResponse<Livestock>>(`/livestock/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/livestock/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/livestock/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/livestock/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/livestock/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/livestock/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/livestock/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Livestock.xlsx');
  },
};

