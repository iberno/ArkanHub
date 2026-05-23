import { api } from './api';
import type { Role } from '../types/api';

export const rolesService = {
  findAll: () => api.get<Role[]>('/roles').then((r) => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Role>('/roles', data).then((r) => r.data),
  remove: (id: string) => api.delete(`/roles/${id}`),
  assignPermission: (roleId: string, permissionId: string) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}`),
  removePermission: (roleId: string, permissionId: string) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`),
};
