import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, ServiceNetwork, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const serviceNetworkService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<ServiceNetwork>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<ServiceNetwork>>>('/service-network', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<ServiceNetwork> => {
    const res = await apiClient.get<ApiResponse<ServiceNetwork>>(`/service-network/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<ServiceNetwork>): Promise<ServiceNetwork> => {
    const res = await apiClient.post<ApiResponse<ServiceNetwork>>('/service-network', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<ServiceNetwork>): Promise<ServiceNetwork> => {
    const res = await apiClient.put<ApiResponse<ServiceNetwork>>(`/service-network/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/service-network/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/service-network/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/service-network/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/service-network/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/service-network/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/service-network/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Service Network.xlsx');
  },
};
