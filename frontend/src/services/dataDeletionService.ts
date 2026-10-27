import { apiClient } from './api';
import { DeletionRequestRecord } from './adminService';

export interface SubmitDeletionDTO {
  dataType: string;
  dataId: number;
  dataTitle?: string;
  reason: string;
  userId?: number;
  userCustomId?: string;
  userEmail?: string;
  userName?: string;
}

export const dataDeletionService = {
  async submitRequest(payload: SubmitDeletionDTO): Promise<DeletionRequestRecord> {
    const res = await apiClient.post<{ success: boolean; message: string; data: DeletionRequestRecord }>(
      '/data-deletions/request',
      payload
    );
    return res.data.data;
  },

  async getMyRequests(userId?: number): Promise<DeletionRequestRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: DeletionRequestRecord[] }>(
      '/data-deletions/my-requests',
      { params: userId ? { userId } : {} }
    );
    return res.data.data;
  },
};
