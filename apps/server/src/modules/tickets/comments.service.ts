import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ticketId: string) {
    await this.ensureTicketExists(ticketId);

    return this.prisma.ticketComment.findMany({
      where: { ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    ticketId: string;
    userId: string;
    comment: string;
    internal: boolean;
  }) {
    await this.ensureTicketExists(data.ticketId);

    return this.prisma.ticketComment.create({
      data,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  private async ensureTicketExists(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
  }
}
