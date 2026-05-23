import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.client.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async create(data: { name: string; email?: string; phone?: string; companyId: string; departmentId?: string }) {
    return this.prisma.client.create({ data });
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string; departmentId?: string; active?: boolean }) {
    await this.prisma.client.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Cliente não encontrado');
    });
    return this.prisma.client.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.client.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Cliente não encontrado');
    });
    return this.prisma.client.delete({ where: { id } });
  }
}
