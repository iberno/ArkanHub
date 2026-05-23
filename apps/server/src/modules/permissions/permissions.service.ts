import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany();
  }

  async create(key: string, description?: string) {
    const existing = await this.prisma.permission.findUnique({ where: { key } });
    if (existing) {
      throw new ConflictException('Permissão já existe');
    }

    return this.prisma.permission.create({
      data: { key, description },
    });
  }

  async remove(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await this.prisma.rolePermission.deleteMany({ where: { permissionId: id } });
    return this.prisma.permission.delete({ where: { id } });
  }
}
