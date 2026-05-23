import { api } from './api';
import type { Permission } from '../types/api';

export const permissionsService = {
  findAll: () => api.get<Permission[]>('/permissions').then((r) => r.data),
};
