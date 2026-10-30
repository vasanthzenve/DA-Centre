import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, HumanPetLab, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const humanPetLabService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<HumanPetLab>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<HumanPetLab>>>('/human-pet-labs', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<HumanPetLab> => {
    const res = await apiClient.get<ApiResponse<HumanPetLab>>(`/human-pet-labs/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<HumanPetLab>): Promise<HumanPetLab> => {
    const res = await apiClient.post<ApiResponse<HumanPetLab>>('/human-pet-labs', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<HumanPetLab>): Promise<HumanPetLab> => {
    const res = await apiClient.put<ApiResponse<HumanPetLab>>(`/human-pet-labs/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/human-pet-labs/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/human-pet-labs/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/human-pet-labs/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/human-pet-labs/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/human-pet-labs/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/human-pet-labs/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Human and Pet Labs.xlsx');
  },
};

