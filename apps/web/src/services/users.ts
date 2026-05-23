import { api } from './api';
import type { User } from '../types/api';

export const usersService = {
  async findAll() {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async create(body: { name: string; email: string; password: string }) {
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
};
