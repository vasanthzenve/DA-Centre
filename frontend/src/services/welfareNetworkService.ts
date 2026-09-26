import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, WelfareNetwork, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const welfareNetworkService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<WelfareNetwork>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<WelfareNetwork>>>('/welfare-network', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<WelfareNetwork> => {
    const res = await apiClient.get<ApiResponse<WelfareNetwork>>(`/welfare-network/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<WelfareNetwork>): Promise<WelfareNetwork> => {
    const res = await apiClient.post<ApiResponse<WelfareNetwork>>('/welfare-network', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<WelfareNetwork>): Promise<WelfareNetwork> => {
    const res = await apiClient.put<ApiResponse<WelfareNetwork>>(`/welfare-network/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/welfare-network/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/welfare-network/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/welfare-network/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/welfare-network/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/welfare-network/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/welfare-network/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Welfare Network.xlsx');
  },
};
