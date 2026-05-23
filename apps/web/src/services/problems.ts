import { api } from './api';
import type { Problem, KnownError } from '../types/api';

export const problemsService = {
  findAll: () => api.get<Problem[]>('/problems').then(r => r.data),
  findOne: (id: string) => api.get<Problem>(`/problems/${id}`).then(r => r.data),
  create: (data: {
    title: string; description: string; reporterId: string;
    impact?: string; urgency?: string; priority?: string; category?: string;
    assigneeId?: string;
  }) => api.post<Problem>('/problems', data).then(r => r.data),
  update: (id: string, data: Partial<Problem>) => api.patch<Problem>(`/problems/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/problems/${id}`),

  knownErrors: () => api.get<KnownError[]>('/problems/known-errors/all').then(r => r.data),
  createKnownError: (data: { problemId?: string; title: string; description: string; workaround?: string }) =>
    api.post<KnownError>('/problems/known-errors', data).then(r => r.data),
  removeKnownError: (id: string) => api.delete(`/problems/known-errors/${id}`),
};
