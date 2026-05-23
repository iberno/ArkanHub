import { api } from './api';
import type { ApprovalFlow, ApprovalRequest } from '../types/api';

export const approvalsService = {
  // Flows
  findAllFlows: () => api.get<ApprovalFlow[]>('/approval-flows').then((r) => r.data),
  findFlow: (id: string) => api.get<ApprovalFlow>(`/approval-flows/${id}`).then((r) => r.data),
  createFlow: (data: { name: string; entityType: string }) =>
    api.post<ApprovalFlow>('/approval-flows', data).then((r) => r.data),
  updateFlow: (id: string, data: { name?: string; entityType?: string }) =>
    api.patch<ApprovalFlow>(`/approval-flows/${id}`, data).then((r) => r.data),
  removeFlow: (id: string) => api.delete(`/approval-flows/${id}`),

  // Steps
  addStep: (flowId: string, data: { stepOrder: number; approverType: string }) =>
    api.post(`/approval-flows/${flowId}/steps`, data),
  removeStep: (flowId: string, stepId: string) =>
    api.delete(`/approval-flows/${flowId}/steps/${stepId}`),

  // Requests
  findByTicket: (ticketId: string) =>
    api.get<ApprovalRequest[]>(`/tickets/${ticketId}/approvals`).then((r) => r.data),
  createRequest: (ticketId: string, flowId: string) =>
    api.post<ApprovalRequest>(`/tickets/${ticketId}/approvals`, { flowId }).then((r) => r.data),
  approve: (id: string, userId: string, comments?: string) =>
    api.post(`/approval-requests/${id}/approve`, { userId, comments }),
  reject: (id: string, userId: string, comments?: string) =>
    api.post(`/approval-requests/${id}/reject`, { userId, comments }),
};
