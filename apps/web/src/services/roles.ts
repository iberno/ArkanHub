import { api } from './api';
import type { Role } from '../types/api';

export const rolesService = {
  findAll: () => api.get<Role[]>('/roles').then((r) => r.data),
};
