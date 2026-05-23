import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.problem.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { tickets: true, knownErrors: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        tickets: { select: { id: true, protocol: true, title: true, status: { select: { name: true, color: true } } } },
        knownErrors: true,
      },
    });
    if (!problem) throw new NotFoundException('Problema não encontrado');
    return problem;
  }

  async create(data: {
    title: string; description: string; reporterId: string;
    impact?: string; urgency?: string; priority?: string; category?: string;
    assigneeId?: string;
  }) {
    return this.prisma.problem.create({ data });
  }

  async update(id: string, data: {
    title?: string; description?: string; status?: string;
    impact?: string; urgency?: string; priority?: string; category?: string;
    rootCause?: string; solution?: string; workaround?: string;
    assigneeId?: string; resolvedAt?: string | null;
  }) {
    await this.prisma.problem.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Problema não encontrado');
    });
    return this.prisma.problem.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.problem.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Problema não encontrado');
    });
    return this.prisma.problem.delete({ where: { id } });
  }

  // Known Errors
  async findKnownErrors(problemId?: string) {
    return this.prisma.knownError.findMany({
      where: problemId ? { problemId } : undefined,
      include: { problem: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createKnownError(data: { problemId?: string; title: string; description: string; workaround?: string }) {
    return this.prisma.knownError.create({ data });
  }

  async removeKnownError(id: string) {
    return this.prisma.knownError.delete({ where: { id } });
  }
}
