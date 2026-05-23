import { api } from './api';
import type { Department } from '../types/api';

export const departmentsService = {
  findAll: (companyId?: string) =>
    api.get<Department[]>('/departments', { params: { companyId } }).then(r => r.data),
  findOne: (id: string) => api.get<Department>(`/departments/${id}`).then(r => r.data),
  create: (data: { name: string; companyId: string; managerId?: string }) =>
    api.post<Department>('/departments', data).then(r => r.data),
  update: (id: string, data: { name?: string; managerId?: string; active?: boolean }) =>
    api.patch<Department>(`/departments/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/departments/${id}`),
};
