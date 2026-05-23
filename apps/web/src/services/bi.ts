import { api } from './api';
import type { BiOverview, BiDistribution, BiTrend, BiMonthly, BiDeptPerformance } from '../types/api';

export const biService = {
  overview: () => api.get<BiOverview>('/bi/overview').then(r => r.data),
  distribution: () => api.get<BiDistribution>('/bi/distribution').then(r => r.data),
  trends: (days = 30) => api.get<BiTrend[]>(`/bi/trends/${days}`).then(r => r.data),
  monthly: () => api.get<BiMonthly[]>('/bi/monthly').then(r => r.data),
  performanceDepartments: () => api.get<BiDeptPerformance[]>('/bi/performance/departments').then(r => r.data),
};
