import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ChangesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.change.findMany({
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { approvals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const change = await this.prisma.change.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        approvals: {
          include: { approver: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!change) throw new NotFoundException('Mudança não encontrada');
    return change;
  }

  async create(data: {
    title: string; description: string; requesterId: string;
    type?: string; priority?: string; riskLevel?: string; impact?: string;
    justification?: string; assigneeId?: string;
  }) {
    return this.prisma.change.create({ data });
  }

  async update(id: string, data: any) {
    await this.prisma.change.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Mudança não encontrada');
    });
    return this.prisma.change.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.change.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Mudança não encontrada');
    });
    await this.prisma.changeApproval.deleteMany({ where: { changeId: id } });
    return this.prisma.change.delete({ where: { id } });
  }

  // Approvals
  async addApproval(changeId: string, data: { approvedBy: string; role: string; status?: string; comments?: string }) {
    return this.prisma.changeApproval.create({ data: { ...data, changeId } });
  }

  async updateApproval(id: string, data: { status?: string; comments?: string }) {
    return this.prisma.changeApproval.update({ where: { id }, data });
  }
}
