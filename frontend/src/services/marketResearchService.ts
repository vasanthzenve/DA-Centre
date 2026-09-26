import apiClient, { downloadFile } from './api';
import { ApiResponse, PageResponse, MarketResearch, FilterParams, ExcelPreviewResponse, ExportRequest } from '../types';

export const marketResearchService = {
  getAll: async (params?: FilterParams): Promise<PageResponse<MarketResearch>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<MarketResearch>>>('/market-research', { params });
    return res.data.data;
  },

  getById: async (id: number): Promise<MarketResearch> => {
    const res = await apiClient.get<ApiResponse<MarketResearch>>(`/market-research/${id}`);
    return res.data.data;
  },

  create: async (data: Partial<MarketResearch>): Promise<MarketResearch> => {
    const res = await apiClient.post<ApiResponse<MarketResearch>>('/market-research', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<MarketResearch>): Promise<MarketResearch> => {
    const res = await apiClient.put<ApiResponse<MarketResearch>>(`/market-research/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/market-research/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete('/market-research/bulk', { data: ids });
  },

  getFilterOptions: async (): Promise<Record<string, string[]>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string[]>>>('/market-research/filter-options');
    return res.data.data;
  },

  previewExcel: async (file: File): Promise<ExcelPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelPreviewResponse>>('/market-research/import-excel/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  confirmImport: async (validRows: Record<string, any>[]): Promise<number> => {
    const res = await apiClient.post<ApiResponse<number>>('/market-research/import-excel/confirm', { validRows });
    return res.data.data;
  },

  exportExcel: async (request: ExportRequest): Promise<void> => {
    const res = await apiClient.post('/market-research/export-excel', request, {
      responseType: 'blob',
    });
    downloadFile(res.data, 'Market Research.xlsx');
  },
};
