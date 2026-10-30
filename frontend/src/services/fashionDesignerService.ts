import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, FashionDesigner, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const fashionDesignerService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<FashionDesigner>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<FashionDesigner>>>('/fashion-designers', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<FashionDesigner> => {
    const res = await apiClient.get<ApiResponse<FashionDesigner>>(`/fashion-designers/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<FashionDesigner>): Promise<FashionDesigner> => {
    const res = await apiClient.post<ApiResponse<FashionDesigner>>('/fashion-designers', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<FashionDesigner>): Promise<FashionDesigner> => {
    const res = await apiClient.put<ApiResponse<FashionDesigner>>(`/fashion-designers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/fashion-designers/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/fashion-designers/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/fashion-designers/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/fashion-designers/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/fashion-designers/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/fashion-designers/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Fashion Designers.xlsx');
  },
};

