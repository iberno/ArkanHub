import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { categoryId?: string; status?: string; companyId?: string; search?: string }) {
    const where: any = {};
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.status) where.status = params.status;
    if (params?.companyId) where.companyId = params.companyId;
    if (params?.search) {
      where.OR = [
        { tag: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { serialNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.asset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        ticketLinks: {
          include: {
            ticket: {
              select: { id: true, protocol: true, title: true, status: { select: { name: true } } },
            },
          },
        },
      },
    });
    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }

  async create(data: {
    tag: string;
    name: string;
    categoryId: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    status?: string;
    purchaseDate?: string;
    warrantyEnd?: string;
    assignedTo?: string;
    departmentId?: string;
    companyId?: string;
    notes?: string;
  }) {
    return this.prisma.asset.create({
      data: {
        tag: data.tag,
        name: data.name,
        categoryId: data.categoryId,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        status: data.status || 'active',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : undefined,
        assignedTo: data.assignedTo,
        departmentId: data.departmentId,
        companyId: data.companyId,
        notes: data.notes,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyEnd) updateData.warrantyEnd = new Date(data.warrantyEnd);
    return this.prisma.asset.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.asset.delete({ where: { id } });
    return { message: 'Ativo removido com sucesso' };
  }
}
