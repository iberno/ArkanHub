import { api } from './api';
import type { Category } from '../types/api';

export const categoriesService = {
  findAll: () => api.get<Category[]>('/categories').then(r => r.data),
  findOne: (id: string) => api.get<Category>(`/categories/${id}`).then(r => r.data),
  create: (data: { name: string; parentId?: string }) =>
    api.post<Category>('/categories', data).then(r => r.data),
  update: (id: string, data: { name?: string; parentId?: string }) =>
    api.patch<Category>(`/categories/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
