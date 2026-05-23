import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventsGateway } from '../websocket/websocket.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.ticket.findMany({
      include: {
        status: true,
        priority: true,
        requester: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTicketDto) {
    const protocol = `TK-${Date.now().toString(36).toUpperCase()}`;

    const ticket = await this.prisma.ticket.create({
      data: {
        protocol,
        title: dto.title,
        description: dto.description,
        requesterId: dto.requesterId,
        statusId: dto.statusId,
        priorityId: dto.priorityId,
        categoryId: dto.categoryId,
      },
    });

    this.events.emitToUser(dto.requesterId, 'ticket:created', ticket);
    return ticket;
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        status: true,
        priority: true,
        category: true,
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: {
        status: true,
        priority: true,
      },
    });

    this.events.emitToTicket(id, 'ticket:updated', updated);
    return updated;
  }
}
