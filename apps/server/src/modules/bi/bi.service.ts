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
    const satisfaction = await this.getSatisfactionStats();

    return {
      total, abertos, emAndamento, aguardando, resolvidos, fechados,
      backlog, criticos, mttr, mtta, slaCompliance, satisfaction,
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
    const categories = await this.prisma.category.findMany();

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

  async getMonthlyReport() {
    const tickets = await this.prisma.ticket.findMany({
      select: { createdAt: true, resolvedAt: true },
    });

    const satisfactions = await this.prisma.ticketSatisfaction.findMany({
      select: { rating: true, createdAt: true },
    });

    // Group by year-month
    const months: Record<string, { created: number; resolved: number; satisfactionSum: number; satisfactionCount: number }> = {};
    const now = new Date();

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { created: 0, resolved: 0, satisfactionSum: 0, satisfactionCount: 0 };
    }

    for (const t of tickets) {
      const cKey = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (months[cKey]) months[cKey].created++;
      if (t.resolvedAt) {
        const rKey = `${t.resolvedAt.getFullYear()}-${String(t.resolvedAt.getMonth() + 1).padStart(2, '0')}`;
        if (months[rKey]) months[rKey].resolved++;
      }
    }

    for (const s of satisfactions) {
      const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].satisfactionSum += s.rating;
        months[key].satisfactionCount++;
      }
    }

    const entries = Object.entries(months).map(([month, data]) => ({
      month,
      created: data.created,
      resolved: data.resolved,
      satisfactionAvg: data.satisfactionCount > 0 ? Number((data.satisfactionSum / data.satisfactionCount).toFixed(2)) : null,
    }));

    // Calculate MoM % change
    return entries.map((entry, i) => {
      const prev = i > 0 ? entries[i - 1] : null;
      return {
        ...entry,
        createdChange: prev ? this.pctChange(prev.created, entry.created) : null,
        resolvedChange: prev ? this.pctChange(prev.resolved, entry.resolved) : null,
      };
    });
  }

  async getPerformanceByDepartment() {
    const departments = await this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        tickets: {
          select: { openedAt: true, resolvedAt: true, slaId: true, sla: { select: { resolutionTime: true } } },
          where: { resolvedAt: { not: null } },
        },
        _count: { select: { tickets: true } },
      },
    });

    const result = [];
    for (const dept of departments) {
      const resolved = dept.tickets;
      if (resolved.length === 0) continue;

      const totalHours = resolved.reduce((sum, t) => {
        return sum + (t.resolvedAt!.getTime() - t.openedAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      const avgResolutionTime = Math.round((totalHours / resolved.length) * 10) / 10;

      const withinSla = resolved.filter((t) => {
        if (!t.sla) return false;
        return (t.resolvedAt!.getTime() - t.openedAt.getTime()) / (1000 * 60 * 60) <= t.sla.resolutionTime;
      });
      const slaCompliance = Math.round((withinSla.length / resolved.length) * 100);

      result.push({
        name: dept.name,
        totalTickets: dept._count.tickets,
        resolvedTickets: resolved.length,
        avgResolutionTime,
        slaCompliance,
      });
    }

    return result.sort((a, b) => b.resolvedTickets - a.resolvedTickets);
  }

  private async getSatisfactionStats() {
    const result = await this.prisma.ticketSatisfaction.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const distribution = await this.prisma.ticketSatisfaction.groupBy({
      by: ['rating'],
      _count: true,
      orderBy: { rating: 'asc' },
    });

    const total = result._count.rating;
    const promoters = distribution.filter(d => d.rating >= 4).reduce((s, d) => s + d._count, 0);

    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(2)) : null,
      total,
      nps: total > 0 ? Math.round((promoters / total) * 100) : null,
      distribution: distribution.map(d => ({ rating: d.rating, count: d._count })),
    };
  }

  // ─── Private ────────────────────────────────────────

  private async countByStatus(name: string) {
    return this.prisma.ticket.count({ where: { status: { name } } });
  }

  private pctChange(prev: number, curr: number): number | null {
    if (prev === 0) return curr > 0 ? 100 : null;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  }

  private async calcMttr() {
    const resolved = await this.prisma.ticket.findMany({
      where: { resolvedAt: { not: null } },
      select: { openedAt: true, resolvedAt: true },
    });

    if (resolved.length === 0) return null;

    const totalHours = resolved.reduce((sum, t) => {
      return sum + (t.resolvedAt!.getTime() - t.openedAt.getTime()) / (1000 * 60 * 60);
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
      return sum + (h.createdAt.getTime() - h.ticket.openedAt.getTime()) / (1000 * 60 * 60);
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
