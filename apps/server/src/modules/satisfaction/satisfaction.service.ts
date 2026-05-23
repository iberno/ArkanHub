import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class SatisfactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTicket(ticketId: string) {
    return this.prisma.ticketSatisfaction.findUnique({
      where: { ticketId },
    });
  }

  async upsert(ticketId: string, data: { rating: number; comment?: string }) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { status: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    if (ticket.status.name !== 'Resolvido' && ticket.status.name !== 'Fechado') {
      throw new ConflictException('Só é possível avaliar tickets resolvidos ou fechados');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new ConflictException('Avaliação deve ser entre 1 e 5');
    }

    return this.prisma.ticketSatisfaction.upsert({
      where: { ticketId },
      update: { rating: data.rating, comment: data.comment },
      create: { ticketId, rating: data.rating, comment: data.comment },
    });
  }

  async getStats() {
    const result = await this.prisma.ticketSatisfaction.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const distribution = await this.prisma.ticketSatisfaction.groupBy({
      by: ['rating'],
      _count: true,
      orderBy: { rating: 'asc' },
    });

    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(2)) : null,
      total: result._count.rating,
      distribution: distribution.map((d) => ({ rating: d.rating, count: d._count })),
    };
  }
}
