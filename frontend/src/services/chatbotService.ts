import { apiClient } from './api';
import { ChatMessageRecord } from './adminService';

export interface SendChatMessageDTO {
  message: string;
  userEmail?: string;
  userName?: string;
  userId?: number;
  userCustomId?: string;
}

export const chatbotService = {
  async sendMessage(payload: SendChatMessageDTO): Promise<ChatMessageRecord> {
    const res = await apiClient.post<{ success: boolean; message: string; data: ChatMessageRecord }>(
      '/chatbot/send',
      payload
    );
    return res.data.data;
  },

  async getUserMessages(userEmail?: string): Promise<ChatMessageRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: ChatMessageRecord[] }>('/chatbot/messages', {
      params: userEmail ? { userEmail } : {},
    });
    return res.data.data;
  },
};
