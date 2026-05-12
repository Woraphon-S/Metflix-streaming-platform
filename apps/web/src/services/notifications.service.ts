import { api } from './api';
import type { NotificationItem, NotificationType } from '@metflix/shared-types';

export interface AdminNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  targetUserId?: string | null;
  payload?: Record<string, unknown>;
}

export const notificationsService = {
  list: async (limit = 30): Promise<NotificationItem[]> => {
    const { data } = await api.get<NotificationItem[]>('/notifications', {
      params: { limit },
    });
    return data;
  },
  unreadCount: async (): Promise<{ unread: number }> => {
    const { data } = await api.get<{ unread: number }>('/notifications/unread-count');
    return data;
  },
  markRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await api.post('/notifications/read-all');
  },
  adminCreate: async (payload: AdminNotificationInput) => {
    const { data } = await api.post('/admin/notifications', payload);
    return data;
  },
};
