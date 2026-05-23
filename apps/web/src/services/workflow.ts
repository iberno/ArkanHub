import { api } from './api';
import type { WorkflowRule, WorkflowExecution } from '../types/api';

export const workflowService = {
  findAll: () => api.get<WorkflowRule[]>('/workflows').then(r => r.data),
  findOne: (id: string) => api.get<WorkflowRule>(`/workflows/${id}`).then(r => r.data),
  create: (name: string, active?: boolean) => api.post<WorkflowRule>('/workflows', { name, active }).then(r => r.data),
  update: (id: string, data: { name?: string; active?: boolean }) =>
    api.patch<WorkflowRule>(`/workflows/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/workflows/${id}`),

  addCondition: (id: string, data: { field: string; operator: string; value: string }) =>
    api.post(`/workflows/${id}/conditions`, data),
  removeCondition: (conditionId: string) => api.delete(`/workflows/conditions/${conditionId}`),

  addAction: (id: string, data: { actionType: string; payload: string }) =>
    api.post(`/workflows/${id}/actions`, data),
  removeAction: (actionId: string) => api.delete(`/workflows/actions/${actionId}`),

  findExecutions: () => api.get<WorkflowExecution[]>('/workflows/executions/all').then(r => r.data),
  execute: (workflowId: string, ticketId: string) =>
    api.post(`/workflows/${workflowId}/execute/${ticketId}`),
};
