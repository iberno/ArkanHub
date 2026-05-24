import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  reply: string;
  suggestions?: { label: string; action: string; payload?: any }[];
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMessage(
    userId: string,
    message: string,
    conversationId?: string,
  ): Promise<{ conversationId: string; response: ChatbotResponse }> {
    const lower = message.toLowerCase().trim();
    let conversation: any;

    if (conversationId) {
      conversation = await this.prisma.chatbotConversation.findUnique({
        where: { id: conversationId },
      });
      if (conversation) {
        const msgs = (conversation.messages as ChatbotMessage[]) || [];
        msgs.push({ role: 'user', content: message });
        conversation.messages = msgs;
      }
    }

    if (!conversation) {
      conversation = await this.prisma.chatbotConversation.create({
        data: {
          userId,
          messages: [{ role: 'user', content: message }] as any as Prisma.InputJsonValue,
        },
      });
    }

    const reply = await this.generateReply(userId, lower, (conversation.messages as ChatbotMessage[]) || []);

    const msgs = (conversation.messages as ChatbotMessage[]) || [];
    msgs.push({ role: 'assistant', content: reply.reply });

    await this.prisma.chatbotConversation.update({
      where: { id: conversation.id },
      data: { messages: msgs as any as Prisma.InputJsonValue },
    });

    return { conversationId: conversation.id, response: reply };
  }

  private async generateReply(userId: string, message: string, history: ChatbotMessage[]): Promise<ChatbotResponse> {
    if (this.matchIntent(message, ['criar ticket', 'abrir chamado', 'novo ticket', 'novo chamado'])) {
      return {
        reply: 'Posso ajudar a criar um novo ticket! Por favor, informe o título e a descrição do problema que está enfrentando.',
        suggestions: [
          { label: 'Abrir formulário de ticket', action: 'navigate', payload: '/tickets?new=true' },
        ],
      };
    }

    if (this.matchIntent(message, ['meus tickets', 'meus chamados', 'status ticket', 'andar'])) {
      const tickets = await this.prisma.ticket.findMany({
        where: { requesterId: userId },
        include: { status: true, priority: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (tickets.length === 0) {
        return { reply: 'Você não possui tickets abertos no momento.' };
      }

      const list = tickets
        .map((t) => `• *${t.protocol}* — ${t.title} (${t.status.name})`)
        .join('\n');
      return {
        reply: `Aqui estão seus tickets recentes:\n${list}`,
        suggestions: [
          { label: 'Ver todos os tickets', action: 'navigate', payload: '/tickets' },
        ],
      };
    }

    if (this.matchIntent(message, ['artigo', 'knowledge base', 'base conhecimento', 'como resolver', 'guia'])) {
      const articles = await this.prisma.knowledgeArticle.findMany({
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      if (articles.length === 0) {
        return { reply: 'Ainda não há artigos na base de conhecimento.' };
      }

      const list = articles.map((a) => `• *${a.title}*`).join('\n');
      return {
        reply: `Aqui estão os artigos disponíveis na base de conhecimento:\n${list}`,
        suggestions: [
          { label: 'Abrir Knowledge Base', action: 'navigate', payload: '/knowledge' },
        ],
      };
    }

    const kbResults = await this.searchKnowledgeBase(message);
    if (kbResults.length > 0) {
      return {
        reply: `Encontrei alguns artigos que podem ajudar:\n${kbResults.map((a) => `• *${a.title}*`).join('\n')}`,
        suggestions: [
          { label: 'Ver resultados', action: 'navigate', payload: '/knowledge' },
        ],
      };
    }

    const similarTickets = await this.searchSimilarTickets(message, userId);
    if (similarTickets.length > 0) {
      return {
        reply: `Encontrei tickets similares que podem ter informações úteis:\n${similarTickets.map((t) => `• *${t.protocol}* — ${t.title}`).join('\n')}`,
      };
    }

    return {
      reply: 'Olá! Como posso ajudar? Posso consultar seus tickets, buscar na base de conhecimento ou ajudar a criar um novo chamado.',
      suggestions: [
        { label: 'Meus tickets', action: 'navigate', payload: '/tickets' },
        { label: 'Criar ticket', action: 'navigate', payload: '/tickets?new=true' },
        { label: 'Base de conhecimento', action: 'navigate', payload: '/knowledge' },
      ],
    };
  }

  private matchIntent(message: string, patterns: string[]): boolean {
    return patterns.some((p) => message.includes(p));
  }

  private async searchKnowledgeBase(query: string): Promise<{ title: string }[]> {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (keywords.length === 0) return [];

    const articles = await this.prisma.knowledgeArticle.findMany({
      select: { title: true },
      take: 5,
    });

    return articles.filter((a) =>
      keywords.some((k) => a.title.toLowerCase().includes(k)),
    );
  }

  private async searchSimilarTickets(query: string, userId: string): Promise<{ protocol: string; title: string }[]> {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (keywords.length === 0) return [];

    const tickets = await this.prisma.ticket.findMany({
      where: { requesterId: userId },
      select: { protocol: true, title: true },
      take: 20,
    });

    return tickets.filter((t) =>
      keywords.some((k) => t.title.toLowerCase().includes(k)),
    );
  }
}
