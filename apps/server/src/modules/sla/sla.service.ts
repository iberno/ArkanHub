import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class SlaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sla.findMany({
      include: { rules: true },
    });
  }

  async create(data: { name: string; responseTime: number; resolutionTime: number }) {
    return this.prisma.sla.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; responseTime: number; resolutionTime: number }>) {
    const sla = await this.prisma.sla.findUnique({ where: { id } });
    if (!sla) {
      throw new NotFoundException('SLA não encontrado');
    }

    return this.prisma.sla.update({ where: { id }, data });
  }

  async remove(id: string) {
    const sla = await this.prisma.sla.findUnique({ where: { id } });
    if (!sla) throw new NotFoundException('SLA não encontrado');

    await this.prisma.slaRule.deleteMany({ where: { slaId: id } });
    await this.prisma.businessHour.deleteMany({ where: { slaId: id } });
    return this.prisma.sla.delete({ where: { id } });
  }

  async calculateDeadline(slaId: string, priority: string) {
    const sla = await this.prisma.sla.findUnique({
      where: { id: slaId },
      include: { slaHours: true },
    });

    if (!sla) {
      throw new NotFoundException('SLA não encontrado');
    }

    const rule = await this.prisma.slaRule.findFirst({
      where: { slaId, priority },
    });

    const responseMinutes = rule
      ? sla.responseTime
      : sla.responseTime;

    const resolutionMinutes = rule
      ? sla.resolutionTime
      : sla.resolutionTime;

    const now = new Date();
    const responseDeadline = new Date(now.getTime() + responseMinutes * 60000);
    const resolutionDeadline = new Date(now.getTime() + resolutionMinutes * 60000);

    return {
      slaName: sla.name,
      priority,
      responseDeadline,
      resolutionDeadline,
      responseMinutes,
      resolutionMinutes,
    };
  }
}
