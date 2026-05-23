import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventsGateway } from '../websocket/websocket.gateway';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsGateway,
  ) {}

  // ─── Rules ──────────────────────────────────────────

  async findAll() {
    return this.prisma.workflowRule.findMany({
      include: { conditions: true, actions: true, _count: { select: { executions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.workflowRule.findUnique({
      where: { id },
      include: { conditions: true, actions: true, executions: { orderBy: { executedAt: 'desc' }, take: 20 } },
    });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return rule;
  }

  async create(data: { name: string; active?: boolean }) {
    return this.prisma.workflowRule.create({ data: { name: data.name, active: data.active ?? true } });
  }

  async update(id: string, data: { name?: string; active?: boolean }) {
    await this.prisma.workflowRule.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Regra não encontrada');
    });
    return this.prisma.workflowRule.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.workflowRule.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Regra não encontrada');
    });
    await this.prisma.workflowCondition.deleteMany({ where: { workflowId: id } });
    await this.prisma.workflowAction.deleteMany({ where: { workflowId: id } });
    return this.prisma.workflowRule.delete({ where: { id } });
  }

  // ─── Conditions ─────────────────────────────────────

  async addCondition(workflowId: string, data: { field: string; operator: string; value: string }) {
    return this.prisma.workflowCondition.create({ data: { ...data, workflowId } });
  }

  async removeCondition(id: string) {
    return this.prisma.workflowCondition.delete({ where: { id } });
  }

  // ─── Actions ─────────────────────────────────────────

  async addAction(workflowId: string, data: { actionType: string; payload: string }) {
    return this.prisma.workflowAction.create({ data: { ...data, workflowId } });
  }

  async removeAction(id: string) {
    return this.prisma.workflowAction.delete({ where: { id } });
  }

  // ─── Execution ───────────────────────────────────────

  async executeForTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { status: true, priority: true, category: true },
    });
    if (!ticket) return;

    const rules = await this.prisma.workflowRule.findMany({
      where: { active: true },
      include: { conditions: true, actions: true },
    });

    for (const rule of rules) {
      if (this.matchesConditions(ticket, rule.conditions)) {
        await this.executeActions(rule, ticket);
        await this.prisma.workflowExecution.create({
          data: {
            workflowId: rule.id,
            ticketId: ticket.id,
            result: JSON.stringify({ actions: rule.actions.map(a => a.actionType) }),
          },
        });
      }
    }
  }

  private matchesConditions(ticket: any, conditions: { field: string; operator: string; value: string }[]): boolean {
    if (conditions.length === 0) return true;

    return conditions.every((c) => {
      const ticketValue = this.getTicketFieldValue(ticket, c.field);
      switch (c.operator) {
        case 'equals': return ticketValue === c.value;
        case 'not_equals': return ticketValue !== c.value;
        case 'contains': return String(ticketValue ?? '').includes(c.value);
        case 'in': return (c.value as any)?.split(',')?.includes(ticketValue) ?? false;
        case 'gt': return Number(ticketValue) > Number(c.value);
        case 'lt': return Number(ticketValue) < Number(c.value);
        default: return false;
      }
    });
  }

  private getTicketFieldValue(ticket: any, field: string): string | null {
    switch (field) {
      case 'statusId': return ticket.statusId;
      case 'priorityId': return ticket.priorityId;
      case 'categoryId': return ticket.categoryId;
      case 'assignedTo': return ticket.assignedTo;
      case 'slaId': return ticket.slaId;
      case 'status_name': return ticket.status?.name ?? null;
      case 'priority_level': return String(ticket.priority?.level ?? '');
      case 'category_name': return ticket.category?.name ?? null;
      default: return ticket[field] ?? null;
    }
  }

  private async executeActions(rule: any, ticket: any) {
    for (const action of rule.actions) {
      try {
        const payload = JSON.parse(action.payload);
        await this.runAction(action.actionType, payload, ticket);
      } catch (e) {
        console.error(`[Workflow] Action ${action.actionType} failed:`, e);
      }
    }
  }

  private async runAction(actionType: string, payload: any, ticket: any) {
    switch (actionType) {
      case 'change_status':
        await this.prisma.ticket.update({ where: { id: ticket.id }, data: { statusId: payload.statusId } });
        break;
      case 'change_priority':
        await this.prisma.ticket.update({ where: { id: ticket.id }, data: { priorityId: payload.priorityId } });
        break;
      case 'assign_user':
        await this.prisma.ticket.update({ where: { id: ticket.id }, data: { assignedTo: payload.userId } });
        break;
      case 'add_comment':
        await this.prisma.ticketComment.create({
          data: { ticketId: ticket.id, userId: payload.userId ?? ticket.requesterId, comment: payload.comment, internal: payload.internal ?? false },
        });
        break;
      case 'send_notification':
        await this.prisma.notification.create({
          data: { userId: payload.userId ?? ticket.requesterId, title: payload.title, body: payload.body, type: 'workflow' },
        });
        this.events.emitToUser(payload.userId ?? ticket.requesterId, 'notification:new', { title: payload.title, body: payload.body });
        break;
    }
  }

  // ─── Execution History ──────────────────────────────

  async findExecutions(workflowId?: string) {
    return this.prisma.workflowExecution.findMany({
      where: workflowId ? { workflowId } : undefined,
      include: { workflow: { select: { id: true, name: true } } },
      orderBy: { executedAt: 'desc' },
      take: 100,
    });
  }
}
