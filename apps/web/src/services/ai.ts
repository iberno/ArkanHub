import { api } from './api';

export interface ChatbotResponse {
  reply: string;
  suggestions?: { label: string; action: string; payload?: any }[];
}

export interface ChatbotResult {
  conversationId: string;
  response: ChatbotResponse;
}

export const aiService = {
  async sendMessage(message: string, conversationId?: string) {
    const { data } = await api.post<ChatbotResult>('/ai/chatbot', { message, conversationId });
    return data;
  },

  async analyze(title: string, description: string) {
    const { data } = await api.post('/ai/analyze', { title, description });
    return data;
  },

  async slaRisk(ticketId: string) {
    const { data } = await api.get(`/ai/sla-risk/${ticketId}`);
    return data;
  },

  async slaStats() {
    const { data } = await api.get('/ai/sla-stats');
    return data;
  },
};
