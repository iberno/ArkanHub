import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ticketId: string) {
    await this.ensureTicketExists(ticketId);

    return this.prisma.ticketAttachment.findMany({
      where: { ticketId },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const attachment = await this.prisma.ticketAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    return attachment;
  }

  async create(data: {
    ticketId: string;
    uploadedBy: string;
    fileName: string;
    filePath: string;
  }) {
    await this.ensureTicketExists(data.ticketId);

    return this.prisma.ticketAttachment.create({
      data,
    });
  }

  private async ensureTicketExists(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
  }
}
