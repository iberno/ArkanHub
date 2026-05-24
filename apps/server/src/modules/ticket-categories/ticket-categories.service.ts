import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const cats = await this.prisma.category.findMany({
      include: { parent: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });

    const ticketCounts = await this.prisma.ticket.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });

    const assetCounts = await this.prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });

    const ticketMap = Object.fromEntries(
      ticketCounts.map(c => [c.categoryId, c._count._all]),
    );
    const assetMap = Object.fromEntries(
      assetCounts.map(c => [c.categoryId, c._count._all]),
    );

    return cats.map(cat => ({
      ...cat,
      _count: { tickets: ticketMap[cat.id] ?? 0, assets: assetMap[cat.id] ?? 0, children: 0 },
    }));
  }

  async findOne(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async create(data: { name: string; parentId?: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: { name?: string; parentId?: string }) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoria removida com sucesso' };
  }
}
