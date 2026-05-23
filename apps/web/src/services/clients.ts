import { api } from './api';
import type { Client } from '../types/api';

export const clientsService = {
  findAll: (companyId?: string) =>
    api.get<Client[]>('/clients', { params: { companyId } }).then(r => r.data),
  findOne: (id: string) => api.get<Client>(`/clients/${id}`).then(r => r.data),
  create: (data: { name: string; email?: string; phone?: string; companyId: string; departmentId?: string }) =>
    api.post<Client>('/clients', data).then(r => r.data),
  update: (id: string, data: { name?: string; email?: string; phone?: string; departmentId?: string; active?: boolean }) =>
    api.patch<Client>(`/clients/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};
