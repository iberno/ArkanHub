import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class BiService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const total = await this.prisma.ticket.count();
    const [abertos, emAndamento, aguardando, resolvidos, fechados] = await Promise.all([
      this.countByStatus('Aberto'),
      this.countByStatus('Em Andamento'),
      this.countByStatus('Aguardando'),
      this.countByStatus('Resolvido'),
      this.countByStatus('Fechado'),
    ]);

    const backlog = abertos + emAndamento + aguardando;
    const criticos = await this.prisma.ticket.count({
      where: { priority: { name: 'Crítica' }, status: { name: { notIn: ['Resolvido', 'Fechado'] } } },
    });

    const mttr = await this.calcMttr();
    const mtta = await this.calcMtta();
    const slaCompliance = await this.calcSlaCompliance();

    return {
      total,
      abertos,
      emAndamento,
      aguardando,
      resolvidos,
      fechados,
      backlog,
      criticos,
      mttr,
      mtta,
      slaCompliance,
    };
  }

  async getDistribution() {
    const [byStatus, byPriority, byCategory] = await Promise.all([
      this.prisma.ticket.groupBy({ by: ['statusId'], _count: { _all: true }, orderBy: { _count: { statusId: 'desc' } } }),
      this.prisma.ticket.groupBy({ by: ['priorityId'], _count: { _all: true }, orderBy: { _count: { priorityId: 'desc' } } }),
      this.prisma.ticket.groupBy({ by: ['categoryId'], _count: { _all: true }, orderBy: { _count: { categoryId: 'desc' } } }),
    ]);

    const statuses = await this.prisma.ticketStatus.findMany();
    const priorities = await this.prisma.ticketPriority.findMany();
    const categories = await this.prisma.ticketCategory.findMany();

    return {
      byStatus: byStatus.map(s => ({ name: statuses.find(st => st.id === s.statusId)?.name ?? 'Desconhecido', count: s._count._all })),
      byPriority: byPriority.map(p => ({ name: priorities.find(pr => pr.id === p.priorityId)?.name ?? 'Desconhecido', count: p._count._all })),
      byCategory: byCategory.map(c => ({ name: categories.find(ca => ca.id === c.categoryId)?.name ?? 'Sem categoria', count: c._count._all })),
    };
  }

  async getTrends(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const tickets = await this.prisma.ticket.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, resolvedAt: true },
    });

    const daily: Record<string, { created: number; resolved: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      daily[key] = { created: 0, resolved: 0 };
    }

    for (const t of tickets) {
      const cKey = t.createdAt.toISOString().slice(0, 10);
      if (daily[cKey]) daily[cKey].created++;
      if (t.resolvedAt) {
        const rKey = t.resolvedAt.toISOString().slice(0, 10);
        if (daily[rKey]) daily[rKey].resolved++;
      }
    }

    return Object.entries(daily).map(([date, data]) => ({ date, ...data }));
  }

  // ─── Private ────────────────────────────────────────

  private async countByStatus(name: string) {
    return this.prisma.ticket.count({ where: { status: { name } } });
  }

  private async calcMttr() {
    const resolved = await this.prisma.ticket.findMany({
      where: { resolvedAt: { not: null } },
      select: { openedAt: true, resolvedAt: true },
    });

    if (resolved.length === 0) return null;

    const totalHours = resolved.reduce((sum, t) => {
      const diff = (t.resolvedAt!.getTime() - t.openedAt.getTime()) / (1000 * 60 * 60);
      return sum + diff;
    }, 0);

    return Math.round((totalHours / resolved.length) * 10) / 10;
  }

  private async calcMtta() {
    const histories = await this.prisma.ticketHistory.findMany({
      where: { field: 'assignedTo', oldValue: null },
      select: { ticket: { select: { openedAt: true } }, createdAt: true },
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    if (histories.length === 0) return null;

    const totalHours = histories.reduce((sum, h) => {
      const diff = (h.createdAt.getTime() - h.ticket.openedAt.getTime()) / (1000 * 60 * 60);
      return sum + diff;
    }, 0);

    return Math.round((totalHours / histories.length) * 10) / 10;
  }

  private async calcSlaCompliance() {
    const tickets = await this.prisma.ticket.findMany({
      where: { slaId: { not: null }, resolvedAt: { not: null } },
      include: { sla: { select: { resolutionTime: true } } },
    });

    if (tickets.length === 0) return null;

    const withinSla = tickets.filter((t) => {
      if (!t.sla) return false;
      const hours = (t.resolvedAt!.getTime() - t.openedAt.getTime()) / (1000 * 60 * 60);
      return hours <= t.sla.resolutionTime;
    });

    return Math.round((withinSla.length / tickets.length) * 100);
  }
}
