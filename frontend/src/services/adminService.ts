import { apiClient } from './api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  totalSessions: number;
  activeSessionsNow: number;
  totalSpendSeconds: number;
  formattedSpendTime: string;
  pendingDeletions: number;
  approvedDeletions: number;
  totalQueries: number;
  unreadQueries: number;
  adminCurrentIp?: string;
  adminNetworkType?: string;
  activeOnlineUsers?: Array<{
    userId: number;
    email: string;
    customUserId?: string;
    ipAddress?: string;
    lastActiveTime?: string;
  }>;
}

export interface UserRecord {
  id: number;
  customUserId?: string;
  username: string;
  email: string;
  mobileNumber?: string;
  fullName?: string;
  role: string;
  accountStatus: string;
  active: boolean;
  totalLoginCount?: number;
  lastLoginAt?: string;
  createdAt?: string;
  department?: string;
  region?: string;
  lastIpAddress?: string;
  registrationIpAddress?: string;
  currentIpAddress?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  mobileNumber?: string;
  role?: string;
  accountStatus?: string;
  active?: boolean;
  department?: string;
  region?: string;
}

export interface UserSessionRecord {
  id: number;
  sessionToken: string;
  userId: number;
  customUserId?: string;
  userEmail: string;
  userRole?: string;
  loginTime: string;
  lastActiveTime: string;
  endTime?: string;
  durationSeconds: number;
  ipAddress?: string;
  userAgent?: string;
  status: string;
}

export interface DeletionRequestRecord {
  id: number;
  userId?: number;
  userCustomId?: string;
  userEmail?: string;
  userName?: string;
  dataType: string;
  dataId: number;
  dataTitle?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedByEmail?: string;
  adminNotes?: string;
  autoDeleted?: boolean;
}

export interface ChatMessageRecord {
  id: number;
  userId?: number;
  userCustomId?: string;
  userEmail: string;
  userName?: string;
  sender: 'USER' | 'ADMIN';
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface ConversationThread {
  userEmail: string;
  userName?: string;
  userCustomId?: string;
  lastMessage: string;
  lastSender: string;
  lastTimestamp: string;
  unreadCount: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/dashboard/stats');
    return res.data.data;
  },

  async getUsers(status?: string): Promise<UserRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: UserRecord[] }>('/admin/users', {
      params: status ? { status } : {},
    });
    return res.data.data;
  },

  async getPendingUsers(): Promise<UserRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: UserRecord[] }>('/admin/users/pending');
    return res.data.data;
  },

  async approveUser(id: number): Promise<UserRecord> {
    const res = await apiClient.post<{ success: boolean; data: UserRecord }>(`/admin/users/${id}/approve`);
    return res.data.data;
  },

  async rejectUser(id: number): Promise<UserRecord> {
    const res = await apiClient.post<{ success: boolean; data: UserRecord }>(`/admin/users/${id}/reject`);
    return res.data.data;
  },

  async createUser(payload: CreateUserPayload): Promise<UserRecord> {
    const res = await apiClient.post<{ success: boolean; data: UserRecord; message?: string }>('/admin/users', payload);
    return res.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async updateUserStatus(id: number, status: string): Promise<UserRecord> {
    const res = await apiClient.put<{ success: boolean; data: UserRecord }>(`/admin/users/${id}/status`, null, {
      params: { status },
    });
    return res.data.data;
  },

  async getSessions(): Promise<UserSessionRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: UserSessionRecord[] }>('/admin/sessions');
    return res.data.data;
  },

  async getDataDeletions(status?: string): Promise<DeletionRequestRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: DeletionRequestRecord[] }>('/admin/data-deletions', {
      params: status ? { status } : {},
    });
    return res.data.data;
  },

  async approveDataDeletion(id: number, adminEmail: string = 'dacentreadmin@gmail.com'): Promise<DeletionRequestRecord> {
    const res = await apiClient.post<{ success: boolean; data: DeletionRequestRecord }>(
      `/admin/data-deletions/${id}/approve?adminEmail=${encodeURIComponent(adminEmail)}`
    );
    return res.data.data;
  },

  async rejectDataDeletion(id: number, adminEmail: string = 'dacentreadmin@gmail.com', reason?: string): Promise<DeletionRequestRecord> {
    const res = await apiClient.post<{ success: boolean; data: DeletionRequestRecord }>(
      `/admin/data-deletions/${id}/reject?adminEmail=${encodeURIComponent(adminEmail)}`,
      reason ? { reason } : {}
    );
    return res.data.data;
  },

  async getChatConversations(): Promise<ConversationThread[]> {
    const res = await apiClient.get<{ success: boolean; data: ConversationThread[] }>('/chatbot/admin/conversations');
    return res.data.data;
  },

  async getChatThread(userEmail: string): Promise<ChatMessageRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: ChatMessageRecord[] }>(
      `/chatbot/admin/thread?userEmail=${encodeURIComponent(userEmail)}`
    );
    return res.data.data;
  },

  async sendChatReply(userEmail: string, message: string, adminEmail: string = 'dacentreadmin@gmail.com'): Promise<ChatMessageRecord> {
    const res = await apiClient.post<{ success: boolean; data: ChatMessageRecord }>('/chatbot/admin/reply', {
      userEmail,
      message,
      adminEmail,
    });
    return res.data.data;
  },

  async getClientIp(): Promise<{ clientIp: string; networkType: string }> {
    const res = await apiClient.get<{ success: boolean; data: { clientIp: string; networkType: string } }>('/admin/current-ip');
    return res.data.data;
  },
};
