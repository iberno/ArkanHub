import { api } from './api';
import type { KnowledgeArticle, KnowledgeCategory, KnowledgeVersion } from '../types/api';

export const knowledgeService = {
  // Categories
  findAllCategories: () => api.get<KnowledgeCategory[]>('/knowledge/categories').then(r => r.data),
  createCategory: (name: string) => api.post<KnowledgeCategory>('/knowledge/categories', { name }).then(r => r.data),
  removeCategory: (id: string) => api.delete(`/knowledge/categories/${id}`),

  // Articles
  findAllArticles: (categoryId?: string) =>
    api.get<KnowledgeArticle[]>('/knowledge/articles', { params: categoryId ? { categoryId } : {} }).then(r => r.data),
  findArticle: (id: string) => api.get<KnowledgeArticle>(`/knowledge/articles/${id}`).then(r => r.data),
  createArticle: (data: { title: string; content: string; categoryId?: string; authorId: string }) =>
    api.post<KnowledgeArticle>('/knowledge/articles', data).then(r => r.data),
  updateArticle: (id: string, data: { title?: string; content?: string; categoryId?: string }) =>
    api.patch<KnowledgeArticle>(`/knowledge/articles/${id}`, data).then(r => r.data),
  removeArticle: (id: string) => api.delete(`/knowledge/articles/${id}`),

  // Versions
  findVersions: (articleId: string) =>
    api.get<KnowledgeVersion[]>(`/knowledge/articles/${articleId}/versions`).then(r => r.data),
  restoreVersion: (articleId: string, versionId: string) =>
    api.post(`/knowledge/articles/${articleId}/versions/${versionId}/restore`),
};
