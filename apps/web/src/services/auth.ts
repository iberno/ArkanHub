import { api } from './api';
import type { AuthTokens } from '../types/api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthTokens>('/auth/login', { email, password });
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post<AuthTokens>('/auth/refresh', { refreshToken });
    return data;
  },

  async logout(refreshToken: string) {
    await api.post('/auth/logout', { refreshToken });
  },
};
