import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, PhilippinesPetProduct, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const philippinesPetProductService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<PhilippinesPetProduct>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<PhilippinesPetProduct>>>('/philippines-pet-products', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<PhilippinesPetProduct> => {
    const res = await apiClient.get<ApiResponse<PhilippinesPetProduct>>(`/philippines-pet-products/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<PhilippinesPetProduct>): Promise<PhilippinesPetProduct> => {
    const res = await apiClient.post<ApiResponse<PhilippinesPetProduct>>('/philippines-pet-products', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<PhilippinesPetProduct>): Promise<PhilippinesPetProduct> => {
    const res = await apiClient.put<ApiResponse<PhilippinesPetProduct>>(`/philippines-pet-products/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/philippines-pet-products/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/philippines-pet-products/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/philippines-pet-products/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/philippines-pet-products/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/philippines-pet-products/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/philippines-pet-products/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Philippines Pet Products.xlsx');
  },
};

