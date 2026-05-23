import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

      return this.generateTokens(user.id, user.email, user.name);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'arkanhub-secret-dev',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

    return this.generateTokens(user.id, user.email, user.name);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(refreshToken: string) {
    return { message: 'Sessão encerrada' };
  }

  private async generateTokens(userId: string, email: string, name: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    const roles = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: { select: { key: true } } } },
              },
            },
          },
        },
      },
    });

    const userRoles = roles?.roles.map((ur) => ur.role.name) ?? [];
    const permissions = [...new Set(
      roles?.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)) ?? [],
    )];

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name, roles: userRoles, permissions },
    };
  }
}
