import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, Accessory, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const accessoryService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<Accessory>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Accessory>>>('/accessories', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<Accessory> => {
    const res = await apiClient.get<ApiResponse<Accessory>>(`/accessories/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Accessory>): Promise<Accessory> => {
    const res = await apiClient.post<ApiResponse<Accessory>>('/accessories', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Accessory>): Promise<Accessory> => {
    const res = await apiClient.put<ApiResponse<Accessory>>(`/accessories/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/accessories/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/accessories/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/accessories/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/accessories/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/accessories/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/accessories/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Accessories.xlsx');
  },
};
