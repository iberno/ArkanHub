import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class TicketCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ticketCategory.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { tickets: true, children: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const cat = await this.prisma.ticketCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async create(data: { name: string; parentId?: string }) {
    return this.prisma.ticketCategory.create({ data });
  }

  async update(id: string, data: { name?: string; parentId?: string }) {
    await this.findOne(id);
    return this.prisma.ticketCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ticketCategory.delete({ where: { id } });
    return { message: 'Categoria removida com sucesso' };
  }
}
