import apiClient, { downloadFile } from './api';
import { ApiResponse, JobInfo, ExportRequest } from '../types';

const moduleEndpointMap: Record<string, string> = {
  doctors: '/doctors',
  doctor: '/doctors',
  'market-research': '/market-research',
  market_research: '/market-research',
  'veterinary-ecosystem': '/veterinary-ecosystem',
  veterinary_ecosystem: '/veterinary-ecosystem',
  'hygiene-products': '/hygiene-products',
  hygiene: '/hygiene-products',
  'food-products': '/food-products',
  food: '/food-products',
  accessories: '/accessories',
  accessory: '/accessories',
  'service-network': '/service-network',
  service_network: '/service-network',
  'welfare-network': '/welfare-network',
  welfare_network: '/welfare-network',
};

export const normalizeModuleKey = (module: string): string => {
  if (!module) return 'market-research';
  const norm = module.toLowerCase().trim()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (norm.includes('market') || norm.includes('research')) return 'market-research';
  if (norm.includes('vet') || norm.includes('hospital') || norm.includes('ecosystem')) return 'veterinary-ecosystem';
  if (norm.includes('hygiene')) return 'hygiene-products';
  if (norm.includes('food') || norm.includes('nutrition')) return 'food-products';
  if (norm.includes('access')) return 'accessories';
  if (norm.includes('service')) return 'service-network';
  if (norm.includes('doc')) return 'doctors';
  if (norm.includes('welfare')) return 'welfare-network';
  return norm;
};

export const jobService = {
  getJobStatus: async (jobId: string): Promise<JobInfo> => {
    const res = await apiClient.get<ApiResponse<JobInfo>>(`/jobs/${jobId}`);
    return res.data.data;
  },

  downloadFile: async (jobId: string, filename?: string): Promise<void> => {
    const res = await apiClient.get(`/jobs/${jobId}/download`, {
      responseType: 'blob',
    });
    downloadFile(res.data, filename || 'export_data');
  },

  startAsyncImport: async (module: string, file: File): Promise<JobInfo> => {
    const canonical = normalizeModuleKey(module);
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<JobInfo>>(`/jobs/${canonical}/import-async`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  startAsyncExport: async (module: string, request: ExportRequest, format: 'csv' | 'xlsx' = 'csv'): Promise<JobInfo> => {
    const canonical = normalizeModuleKey(module);
    const endpoint = moduleEndpointMap[canonical] || `/${canonical}`;
    const res = await apiClient.post<ApiResponse<JobInfo>>(
      `${endpoint}/export-async?format=${format}&scope=${request.scope || 'all'}`,
      request
    );
    return res.data.data;
  },
};
