import { api } from './api';
import type { Project, ProjectPhase, ProjectRisk, ProjectStakeholder, ProjectMilestone } from '../types/api';

export const projectsService = {
  async findAll() {
    const { data } = await api.get<Project[]>('/projects');
    return data;
  },

  async findOne(id: string) {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(body: {
    name: string; description?: string; charter?: string; managerId: string;
    status?: string; priority?: string; startDate?: string; targetEndDate?: string; estimatedBudget?: number;
  }) {
    const { data } = await api.post<Project>('/projects', body);
    return data;
  },

  async update(id: string, body: Record<string, any>) {
    const { data } = await api.patch<Project>(`/projects/${id}`, body);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/projects/${id}`);
  },

  async convertFromTicket(ticketId: string, body: {
    name: string; description?: string; managerId: string;
    status?: string; priority?: string; startDate?: string; targetEndDate?: string;
  }) {
    const { data } = await api.post<Project>(`/projects/from-ticket/${ticketId}`, body);
    return data;
  },

  // Phases
  async addPhase(projectId: string, body: { name: string; description?: string; order?: number }) {
    const { data } = await api.post<ProjectPhase>(`/projects/${projectId}/phases`, body);
    return data;
  },

  async updatePhase(phaseId: string, body: { name?: string; description?: string; order?: number }) {
    const { data } = await api.patch<ProjectPhase>(`/projects/phases/${phaseId}`, body);
    return data;
  },

  async removePhase(phaseId: string) {
    await api.delete(`/projects/phases/${phaseId}`);
  },

  // Risks
  async addRisk(projectId: string, body: { description: string; probability?: string; impact?: string; mitigation?: string; ownerId?: string }) {
    const { data } = await api.post<ProjectRisk>(`/projects/${projectId}/risks`, body);
    return data;
  },

  async updateRisk(riskId: string, body: Record<string, any>) {
    const { data } = await api.patch<ProjectRisk>(`/projects/risks/${riskId}`, body);
    return data;
  },

  async removeRisk(riskId: string) {
    await api.delete(`/projects/risks/${riskId}`);
  },

  // Stakeholders
  async addStakeholder(projectId: string, body: { userId: string; role: string }) {
    const { data } = await api.post<ProjectStakeholder>(`/projects/${projectId}/stakeholders`, body);
    return data;
  },

  async removeStakeholder(stakeholderId: string) {
    await api.delete(`/projects/stakeholders/${stakeholderId}`);
  },

  // Milestones
  async addMilestone(projectId: string, body: { name: string; description?: string; date: string }) {
    const { data } = await api.post<ProjectMilestone>(`/projects/${projectId}/milestones`, body);
    return data;
  },

  async updateMilestone(milestoneId: string, body: { name?: string; description?: string; date?: string; completed?: boolean }) {
    const { data } = await api.patch<ProjectMilestone>(`/projects/milestones/${milestoneId}`, body);
    return data;
  },

  async removeMilestone(milestoneId: string) {
    await api.delete(`/projects/milestones/${milestoneId}`);
  },
};
