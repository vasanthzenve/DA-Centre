import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, Poultry, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const poultryService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<Poultry>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Poultry>>>('/poultry', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<Poultry> => {
    const res = await apiClient.get<ApiResponse<Poultry>>(`/poultry/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Poultry>): Promise<Poultry> => {
    const res = await apiClient.post<ApiResponse<Poultry>>('/poultry', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Poultry>): Promise<Poultry> => {
    const res = await apiClient.put<ApiResponse<Poultry>>(`/poultry/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/poultry/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/poultry/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/poultry/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/poultry/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/poultry/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/poultry/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Poultry.xlsx');
  },
};

