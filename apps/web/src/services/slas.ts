import { api } from './api';
import type { Sla, TicketStatus, TicketPriority } from '../types/api';

export const slasService = {
  async findAll() {
    const { data } = await api.get<Sla[]>('/slas');
    return data;
  },

  async create(body: { name: string; responseTime: number; resolutionTime: number }) {
    const { data } = await api.post<Sla>('/slas', body);
    return data;
  },
};

export const statusesService = {
  async findAll() {
    const { data } = await api.get<TicketStatus[]>('/ticket-statuses');
    return data;
  },
};

export const prioritiesService = {
  async findAll() {
    const { data } = await api.get<TicketPriority[]>('/ticket-priorities');
    return data;
  },
};
