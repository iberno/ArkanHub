import { api } from './api';
import type { Change } from '../types/api';

export const changesService = {
  findAll: () => api.get<Change[]>('/changes').then(r => r.data),
  findOne: (id: string) => api.get<Change>(`/changes/${id}`).then(r => r.data),
  create: (data: {
    title: string; description: string; requesterId: string;
    type?: string; priority?: string; riskLevel?: string; impact?: string;
    justification?: string; assigneeId?: string;
  }) => api.post<Change>('/changes', data).then(r => r.data),
  update: (id: string, data: any) => api.patch<Change>(`/changes/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/changes/${id}`),
  addApproval: (changeId: string, data: { approvedBy: string; role: string; comments?: string }) =>
    api.post(`/changes/${changeId}/approvals`, data),
  updateApproval: (approvalId: string, data: { status?: string; comments?: string }) =>
    api.patch(`/changes/approvals/${approvalId}`, data),
};
