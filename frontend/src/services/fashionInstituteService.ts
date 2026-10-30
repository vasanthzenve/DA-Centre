import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, FashionInstitute, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const fashionInstituteService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<FashionInstitute>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<FashionInstitute>>>('/fashion-institutes', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<FashionInstitute> => {
    const res = await apiClient.get<ApiResponse<FashionInstitute>>(`/fashion-institutes/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<FashionInstitute>): Promise<FashionInstitute> => {
    const res = await apiClient.post<ApiResponse<FashionInstitute>>('/fashion-institutes', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<FashionInstitute>): Promise<FashionInstitute> => {
    const res = await apiClient.put<ApiResponse<FashionInstitute>>(`/fashion-institutes/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/fashion-institutes/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/fashion-institutes/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/fashion-institutes/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/fashion-institutes/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/fashion-institutes/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/fashion-institutes/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Fashion Institutes.xlsx');
  },
};

