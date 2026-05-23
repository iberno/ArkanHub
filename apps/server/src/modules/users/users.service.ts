import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, position: true,
        avatarUrl: true, active: true, companyId: true, departmentId: true,
        createdAt: true, updatedAt: true,
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, position: true,
        avatarUrl: true, active: true, companyId: true, departmentId: true,
        createdAt: true, updatedAt: true,
        company: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        roles: { include: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async assignRole(userId: string, roleId: string) {
    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.role.findUnique({ where: { id: roleId } }),
    ]);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!role) throw new NotFoundException('Papel não encontrado');

    return this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  }

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        position: dto.position,
        companyId: dto.companyId,
        departmentId: dto.departmentId,
        active: dto.active ?? true,
      },
      select: {
        id: true, name: true, email: true, phone: true, position: true,
        active: true, createdAt: true, companyId: true, departmentId: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.companyId !== undefined) data.companyId = dto.companyId;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.active !== undefined) data.active = dto.active;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, phone: true, position: true,
        active: true, avatarUrl: true, updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Usuário removido com sucesso' };
  }
}
