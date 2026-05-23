import { api } from './api';
import type { BiOverview, BiDistribution, BiTrend } from '../types/api';

export const biService = {
  overview: () => api.get<BiOverview>('/bi/overview').then(r => r.data),
  distribution: () => api.get<BiDistribution>('/bi/distribution').then(r => r.data),
  trends: (days = 30) => api.get<BiTrend[]>(`/bi/trends/${days}`).then(r => r.data),
};
