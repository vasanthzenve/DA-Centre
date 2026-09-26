import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, VeterinaryEcosystem, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const veterinaryEcosystemService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<VeterinaryEcosystem>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<VeterinaryEcosystem>>>('/veterinary-ecosystem', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<VeterinaryEcosystem> => {
    const res = await apiClient.get<ApiResponse<VeterinaryEcosystem>>(`/veterinary-ecosystem/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<VeterinaryEcosystem>): Promise<VeterinaryEcosystem> => {
    const res = await apiClient.post<ApiResponse<VeterinaryEcosystem>>('/veterinary-ecosystem', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<VeterinaryEcosystem>): Promise<VeterinaryEcosystem> => {
    const res = await apiClient.put<ApiResponse<VeterinaryEcosystem>>(`/veterinary-ecosystem/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/veterinary-ecosystem/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/veterinary-ecosystem/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/veterinary-ecosystem/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/veterinary-ecosystem/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/veterinary-ecosystem/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/veterinary-ecosystem/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Veterinary Ecosystem.xlsx');
  },
};
