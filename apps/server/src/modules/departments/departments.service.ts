import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId?: string) {
    return this.prisma.department.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        company: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true, clients: true, tickets: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    });
    if (!dept) throw new NotFoundException('Departamento não encontrado');
    return dept;
  }

  async create(data: { name: string; companyId: string; managerId?: string }) {
    return this.prisma.department.create({ data });
  }

  async update(id: string, data: { name?: string; managerId?: string; active?: boolean }) {
    await this.prisma.department.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Departamento não encontrado');
    });
    return this.prisma.department.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.department.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Departamento não encontrado');
    });
    return this.prisma.department.delete({ where: { id } });
  }
}
