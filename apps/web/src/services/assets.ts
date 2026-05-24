import { api } from './api';
import type { Asset } from '../types/api';

export const assetsService = {
  async findAll(params?: { categoryId?: string; status?: string; search?: string }) {
    const { data } = await api.get<Asset[]>('/assets', { params });
    return data;
  },

  async findOne(id: string) {
    const { data } = await api.get<Asset>(`/assets/${id}`);
    return data;
  },

  async create(body: Partial<Asset>) {
    const { data } = await api.post<Asset>('/assets', body);
    return data;
  },

  async update(id: string, body: Partial<Asset>) {
    const { data } = await api.patch<Asset>(`/assets/${id}`, body);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/assets/${id}`);
  },
};
