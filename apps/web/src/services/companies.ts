import { api } from './api';
import type { Company } from '../types/api';

export const companiesService = {
  findAll: () => api.get<Company[]>('/companies').then(r => r.data),
  findOne: (id: string) => api.get<Company>(`/companies/${id}`).then(r => r.data),
  create: (data: { name: string; document?: string }) => api.post<Company>('/companies', data).then(r => r.data),
  update: (id: string, data: { name?: string; document?: string; active?: boolean }) =>
    api.patch<Company>(`/companies/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/companies/${id}`),
};
