import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async create(name: string, description?: string) {
    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException('Papel já existe');
    }

    return this.prisma.role.create({
      data: { name, description },
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Papel não encontrado');

    if (data.name && data.name !== role.name) {
      const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
      if (existing) throw new ConflictException('Nome de papel já em uso');
    }

    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Papel não encontrado');
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  async assignPermission(roleId: string, permissionId: string) {
    const [role, permission] = await Promise.all([
      this.prisma.role.findUnique({ where: { id: roleId } }),
      this.prisma.permission.findUnique({ where: { id: permissionId } }),
    ]);

    if (!role) throw new NotFoundException('Papel não encontrado');
    if (!permission) throw new NotFoundException('Permissão não encontrada');

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
