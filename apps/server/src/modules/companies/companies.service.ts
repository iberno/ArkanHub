import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      include: { _count: { select: { departments: true, clients: true, users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        departments: { where: { active: true }, orderBy: { name: 'asc' } },
        _count: { select: { clients: true, users: true } },
      },
    });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async create(data: { name: string; document?: string }) {
    return this.prisma.company.create({ data });
  }

  async update(id: string, data: { name?: string; document?: string; active?: boolean }) {
    await this.prisma.company.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Empresa não encontrada');
    });
    return this.prisma.company.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.company.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Empresa não encontrada');
    });
    return this.prisma.company.delete({ where: { id } });
  }
}
