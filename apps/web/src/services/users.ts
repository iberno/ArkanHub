import { api } from './api';
import type { User } from '../types/api';

export const usersService = {
  async findAll() {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async findOne(id: string) {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async me() {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async create(body: {
    name: string; email: string; password: string;
    phone?: string; position?: string;
    companyId?: string; departmentId?: string;
  }) {
    const { data } = await api.post<User>('/users', body);
    return data;
  },

  async update(id: string, body: Partial<User & { password?: string }>) {
    const { data } = await api.patch<User>(`/users/${id}`, body);
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete<{ message: string }>(`/users/${id}`);
    return data;
  },

  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<User>('/users/avatar', form);
    return data;
  },

  assignRole: (userId: string, roleId: string) =>
    api.post(`/users/${userId}/roles/${roleId}`),

  removeRole: (userId: string, roleId: string) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
};
