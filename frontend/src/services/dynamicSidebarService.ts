import apiClient, { downloadFile } from './api';
import {
  ApiResponse,
  PageResponse,
  SidebarModule,
  SidebarField,
  ExcelAnalysisResult,
  CreateModulePayload,
  UpdateModulePayload,
} from '../types';

export const dynamicSidebarService = {
  /**
   * 1. Upload & analyze Excel or CSV spreadsheet structure
   */
  analyzeFile: async (file: File): Promise<ExcelAnalysisResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<ExcelAnalysisResult>>('/sidebar/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  /**
   * 2. Create a permanent dynamic sidebar module with analyzed fields and records
   */
  createModule: async (payload: CreateModulePayload, file?: File): Promise<SidebarModule> => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('request', JSON.stringify(payload));
      const res = await apiClient.post<ApiResponse<SidebarModule>>('/sidebar/create-multipart', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      const res = await apiClient.post<ApiResponse<SidebarModule>>('/sidebar/create', payload);
      return res.data.data;
    }
  },

  /**
   * 3. Fetch all active dynamic sidebar modules for menu navigation
   */
  getAllModules: async (): Promise<SidebarModule[]> => {
    const res = await apiClient.get<ApiResponse<SidebarModule[]>>('/sidebar/modules');
    return res.data.data;
  },

  /**
   * 4. Fetch module by ID
   */
  getModuleById: async (id: number): Promise<SidebarModule> => {
    const res = await apiClient.get<ApiResponse<SidebarModule>>(`/sidebar/modules/${id}`);
    return res.data.data;
  },

  /**
   * 5. Fetch module by URL slug
   */
  getModuleBySlug: async (slug: string): Promise<SidebarModule> => {
    const res = await apiClient.get<ApiResponse<SidebarModule>>(`/sidebar/modules/slug/${slug}`);
    return res.data.data;
  },

  /**
   * 6. Fetch field definitions for a module
   */
  getModuleFields: async (id: number, sheetName?: string): Promise<SidebarField[]> => {
    const res = await apiClient.get<ApiResponse<SidebarField[]>>(`/sidebar/modules/${id}/fields`, {
      params: sheetName ? { sheetName } : undefined,
    });
    return res.data.data;
  },

  /**
   * 7. Fetch records for a module with search, pagination, and sorting
   */
  getModuleRecords: async (
    id: number,
    params?: {
      sheetName?: string;
      search?: string;
      page?: number;
      size?: number;
      sortField?: string;
      sortDir?: string;
      [key: string]: any;
    }
  ): Promise<PageResponse<Record<string, any>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Record<string, any>>>>(
      `/sidebar/modules/${id}/records`,
      { params }
    );
    return res.data.data;
  },

  /**
   * 8. Update module metadata
   */
  updateModule: async (id: number, payload: UpdateModulePayload): Promise<SidebarModule> => {
    const res = await apiClient.put<ApiResponse<SidebarModule>>(`/sidebar/modules/${id}`, payload);
    return res.data.data;
  },

  /**
   * 9. Delete a module and all associated fields, records, and files
   */
  deleteModule: async (id: number): Promise<void> => {
    await apiClient.delete(`/sidebar/modules/${id}`);
  },

  /**
   * 10. Bulk delete selected records
   */
  deleteRecords: async (id: number, recordIds: number[]): Promise<void> => {
    await apiClient.delete(`/sidebar/modules/${id}/records`, {
      data: { recordIds },
    });
  },

  /**
   * 11. Replace spreadsheet file and reload data
   */
  replaceFile: async (id: number, file: File): Promise<SidebarModule> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<SidebarModule>>(`/sidebar/modules/${id}/replace-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  /**
   * 12. Export records to an Excel .xlsx file
   */
  exportModule: async (id: number, sheetName?: string, fileName?: string): Promise<void> => {
    const res = await apiClient.get(`/sidebar/modules/${id}/export`, {
      params: sheetName ? { sheetName } : undefined,
      responseType: 'blob',
    });
    downloadFile(res.data, fileName || `module_${id}_export.xlsx`);
  },
};

