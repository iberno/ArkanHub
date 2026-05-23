import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventsGateway } from '../websocket/websocket.gateway';
import { WorkflowService } from '../workflow/workflow.service';
import { ApprovalsService } from '../approvals/approvals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsGateway,
    private readonly workflow: WorkflowService,
    private readonly approvals: ApprovalsService,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll(params?: { assignedTo?: string; unassigned?: boolean }) {
    const where: any = {};
    if (params?.assignedTo) where.assignedTo = params.assignedTo;
    if (params?.unassigned) where.assignedTo = null;

    return this.prisma.ticket.findMany({
      where,
      include: {
        status: true,
        priority: true,
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true } },
        onBehalfOf: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
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
        assignedTo: dto.assignedTo,
        clientId: dto.clientId,
        onBehalfOfId: dto.onBehalfOfId,
        departmentId: dto.departmentId,
        statusId: dto.statusId,
        priorityId: dto.priorityId,
        categoryId: dto.categoryId,
      },
    });

    this.events.emitToUser(dto.requesterId, 'ticket:created', ticket);
    this.workflow.executeForTicket(ticket.id);
    this.createDepartmentApproval(ticket);
    return ticket;
  }

  private async createDepartmentApproval(ticket: any) {
    if (!ticket.departmentId) return;
    const dept = await this.prisma.department.findUnique({ where: { id: ticket.departmentId } });
    if (!dept?.managerId) return;
    const flow = await this.prisma.approvalFlow.findFirst({ where: { entityType: 'ticket' } });
    if (!flow) return;
    try {
      await this.approvals.createRequest(ticket.id, flow.id);
    } catch { /* silent */ }
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
        client: { select: { id: true, name: true, email: true } },
        onBehalfOf: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } },
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

  async update(id: string, dto: UpdateTicketDto, userId?: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.statusId !== undefined) data.statusId = dto.statusId;
    if (dto.priorityId !== undefined) data.priorityId = dto.priorityId;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.clientId !== undefined) data.clientId = dto.clientId;
    if (dto.onBehalfOfId !== undefined) data.onBehalfOfId = dto.onBehalfOfId;
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo;

    const changedFields: { field: string; oldValue: string | null; newValue: string | null }[] = [];

    if (dto.assignedTo !== undefined && dto.assignedTo !== ticket.assignedTo) {
      changedFields.push({
        field: 'assignedTo',
        oldValue: ticket.assignedTo,
        newValue: dto.assignedTo,
      });
    }

    if (dto.departmentId !== undefined && dto.departmentId !== ticket.departmentId) {
      changedFields.push({
        field: 'departmentId',
        oldValue: ticket.departmentId,
        newValue: dto.departmentId,
      });
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        status: true,
        priority: true,
        assignee: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    // Create history entries for changed fields
    const historyData = changedFields.map((f) => ({
      ticketId: id,
      userId: userId || ticket.requesterId,
      field: f.field,
      oldValue: f.oldValue,
      newValue: f.newValue,
    }));

    if (historyData.length > 0) {
      await this.prisma.ticketHistory.createMany({ data: historyData });
    }

    // Notify new assignee
    if (dto.assignedTo && dto.assignedTo !== ticket.assignedTo) {
      try {
        await this.notifications.create({
          userId: dto.assignedTo,
          title: 'Ticket atribuído a você',
          body: `O ticket ${updated.protocol} — ${updated.title} foi atribuído a você.`,
          type: 'assignment',
        });
      } catch { /* silent */ }
    }

    this.events.emitToTicket(id, 'ticket:updated', updated);
    this.workflow.executeForTicket(id);
    return updated;
  }
}
