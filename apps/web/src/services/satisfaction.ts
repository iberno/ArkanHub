import { api } from './api';

export interface Satisfaction {
  id: string;
  ticketId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SatisfactionStats {
  average: number | null;
  total: number;
  distribution: { rating: number; count: number }[];
}

export const satisfactionService = {
  findByTicket: (ticketId: string) =>
    api.get<Satisfaction>(`/tickets/${ticketId}/satisfaction`).then((r) => r.data),

  upsert: (ticketId: string, data: { rating: number; comment?: string }) =>
    api.post<Satisfaction>(`/tickets/${ticketId}/satisfaction`, data).then((r) => r.data),

  stats: () =>
    api.get<SatisfactionStats>('/satisfaction/stats').then((r) => r.data),
};
