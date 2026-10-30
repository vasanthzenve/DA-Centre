import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, PetManufacturer, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const petManufacturerService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<PetManufacturer>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<PetManufacturer>>>('/pet-manufacturers', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<PetManufacturer> => {
    const res = await apiClient.get<ApiResponse<PetManufacturer>>(`/pet-manufacturers/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<PetManufacturer>): Promise<PetManufacturer> => {
    const res = await apiClient.post<ApiResponse<PetManufacturer>>('/pet-manufacturers', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<PetManufacturer>): Promise<PetManufacturer> => {
    const res = await apiClient.put<ApiResponse<PetManufacturer>>(`/pet-manufacturers/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/pet-manufacturers/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/pet-manufacturers/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/pet-manufacturers/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/pet-manufacturers/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/pet-manufacturers/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/pet-manufacturers/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Pet Manufacturers.xlsx');
  },
};

