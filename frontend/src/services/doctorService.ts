import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, Doctor, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const doctorService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<Doctor>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Doctor>>>('/doctors', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<Doctor> => {
    const res = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<Doctor>): Promise<Doctor> => {
    const res = await apiClient.post<ApiResponse<Doctor>>('/doctors', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
    const res = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/doctors/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/doctors/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/doctors/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/doctors/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/doctors/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Doctors.xlsx');
  },
};
