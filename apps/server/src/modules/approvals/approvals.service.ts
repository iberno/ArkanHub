import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllFlows() {
    return this.prisma.approvalFlow.findMany({
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
  }

  async findFlow(id: string) {
    const flow = await this.prisma.approvalFlow.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!flow) throw new NotFoundException('Fluxo não encontrado');
    return flow;
  }

  async createFlow(data: { name: string; entityType: string }) {
    const existing = await this.prisma.approvalFlow.findFirst({ where: { name: data.name } });
    if (existing) throw new ConflictException('Fluxo já existe');
    return this.prisma.approvalFlow.create({ data });
  }

  async updateFlow(id: string, data: { name?: string; entityType?: string }) {
    await this.findFlow(id);
    return this.prisma.approvalFlow.update({ where: { id }, data });
  }

  async removeFlow(id: string) {
    await this.findFlow(id);
    await this.prisma.approvalStep.deleteMany({ where: { flowId: id } });
    return this.prisma.approvalFlow.delete({ where: { id } });
  }

  async addStep(flowId: string, data: { stepOrder: number; approverType: string }) {
    await this.findFlow(flowId);
    return this.prisma.approvalStep.create({ data: { flowId, ...data } });
  }

  async removeStep(flowId: string, stepId: string) {
    const step = await this.prisma.approvalStep.findFirst({ where: { id: stepId, flowId } });
    if (!step) throw new NotFoundException('Etapa não encontrada');
    return this.prisma.approvalStep.delete({ where: { id: stepId } });
  }

  async findRequestsByTicket(ticketId: string) {
    return this.prisma.approvalRequest.findMany({
      where: { ticketId },
      include: {
        flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        histories: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async createRequest(ticketId: string, flowId: string) {
    const [ticket, flow] = await Promise.all([
      this.prisma.ticket.findUnique({ where: { id: ticketId } }),
      this.prisma.approvalFlow.findUnique({ where: { id: flowId }, include: { steps: true } }),
    ]);
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (!flow) throw new NotFoundException('Fluxo não encontrado');
    if (flow.steps.length === 0) throw new BadRequestException('Fluxo sem etapas');

    return this.prisma.approvalRequest.create({
      data: { ticketId, flowId, currentStep: 1 },
      include: {
        flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        histories: true,
      },
    });
  }

  async approve(requestId: string, userId: string, comments?: string) {
    return this.handleAction(requestId, userId, 'approved', comments);
  }

  async reject(requestId: string, userId: string, comments?: string) {
    return this.handleAction(requestId, userId, 'rejected', comments);
  }

  private async handleAction(requestId: string, userId: string, action: string, comments?: string) {
    const req = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
      include: { flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } } },
    });
    if (!req) throw new NotFoundException('Solicitação não encontrada');
    if (req.status !== 'pending') throw new BadRequestException('Solicitação já finalizada');

    const totalSteps = req.flow.steps.length;

    await this.prisma.approvalHistory.create({
      data: { requestId, stepOrder: req.currentStep, approvedBy: userId, action, comments },
    });

    if (action === 'rejected') {
      return this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
        include: { flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } }, histories: true },
      });
    }

    if (req.currentStep >= totalSteps) {
      return this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { status: 'approved' },
        include: { flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } }, histories: true },
      });
    }

    return this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { currentStep: req.currentStep + 1 },
      include: { flow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } }, histories: true },
    });
  }
}
