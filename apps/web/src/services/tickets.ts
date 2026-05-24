import { api } from './api';
import type { Ticket, TicketComment, TicketAttachment } from '../types/api';

export const ticketsService = {
  async findAll(params?: { assignedTo?: string; unassigned?: boolean; statusName?: string }) {
    const { data } = await api.get<Ticket[]>('/tickets', { params });
    return data;
  },

  async findOne(id: string) {
    const { data } = await api.get<Ticket>(`/tickets/${id}`);
    return data;
  },

  async create(body: {
    title: string; description: string; requesterId: string; statusId: string; priorityId: string;
    categoryId?: string; clientId?: string; onBehalfOfId?: string; departmentId?: string;
    assignedTo?: string; assetIds?: string[];
  }) {
    const { data } = await api.post<Ticket>('/tickets', body);
    return data;
  },

  async createBatch(body: {
    title: string; description: string; requesterId: string; statusId: string; priorityId: string;
    categoryId?: string; clientId?: string; onBehalfOfId?: string; departmentId?: string;
    assignedTo?: string; assetIds?: string[];
  }[]) {
    const { data } = await api.post<Ticket[]>('/tickets/batch', body);
    return data;
  },

  async update(id: string, body: Record<string, any>) {
    const { data } = await api.patch<Ticket>(`/tickets/${id}`, body);
    return data;
  },

  async getComments(ticketId: string) {
    const { data } = await api.get<TicketComment[]>(`/tickets/${ticketId}/comments`);
    return data;
  },

  async addComment(ticketId: string, comment: string, internal = false) {
    const { data } = await api.post<TicketComment>(`/tickets/${ticketId}/comments`, { comment, internal });
    return data;
  },

  async getAttachments(ticketId: string) {
    const { data } = await api.get<TicketAttachment[]>(`/tickets/${ticketId}/attachments`);
    return data;
  },

  async uploadAttachment(ticketId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/tickets/${ticketId}/attachments`, form);
    return data;
  },

  async reopen(id: string) {
    const { data } = await api.post<Ticket>(`/tickets/${id}/reopen`);
    return data;
  },

  async createRelated(id: string, body: {
    title: string; description: string; requesterId: string; statusId: string; priorityId: string;
    categoryId?: string; clientId?: string; onBehalfOfId?: string; departmentId?: string;
    assignedTo?: string; assetIds?: string[];
  }) {
    const { data } = await api.post<Ticket>(`/tickets/${id}/related`, body);
    return data;
  },
};
