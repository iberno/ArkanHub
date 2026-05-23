import { api } from './api';
import type { Notification } from '../types/api';

export const notificationsService = {
  findAll: () => api.get<Notification[]>('/notifications').then(r => r.data),
  countUnread: () => api.get<number>('/notifications/unread/count').then(r => r.data),
  create: (data: { userId: string; title: string; body: string; type?: string }) =>
    api.post<Notification>('/notifications', data).then(r => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};
