import { api } from './api';
import type { TicketCategory } from '../types/api';

export const ticketCategoriesService = {
  findAll: () => api.get<TicketCategory[]>('/ticket-categories').then(r => r.data),
  findOne: (id: string) => api.get<TicketCategory>(`/ticket-categories/${id}`).then(r => r.data),
  create: (data: { name: string; parentId?: string }) =>
    api.post<TicketCategory>('/ticket-categories', data).then(r => r.data),
  update: (id: string, data: { name?: string; parentId?: string }) =>
    api.patch<TicketCategory>(`/ticket-categories/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/ticket-categories/${id}`),
};
