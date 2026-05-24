import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class SlaPredictionService {
  private readonly logger = new Logger(SlaPredictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async predictRisk(ticketId: string): Promise<{
    risk: 'low' | 'medium' | 'high';
    estimatedResolutionHours: number;
    remainingHours: number;
    breachProbability: number;
  } | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { sla: true, priority: true, status: true },
    });

    if (!ticket || !ticket.sla) return null;

    const elapsedHours = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    const resolutionHours = ticket.sla.resolutionTime;
    const remainingHours = Math.max(0, resolutionHours - elapsedHours);

    // Simple heuristic prediction based on elapsed time and priority
    const priorityLevel = ticket.priority?.level || 3;
    const elapsedRatio = elapsedHours / resolutionHours;

    let breachProbability = 0;

    // Factors: how much time has passed, priority level, status
    if (elapsedRatio >= 0.9) {
      breachProbability = 0.9;
    } else if (elapsedRatio >= 0.75) {
      breachProbability = 0.6;
    } else if (elapsedRatio >= 0.5) {
      breachProbability = 0.3;
    } else if (elapsedRatio >= 0.25) {
      breachProbability = 0.1;
    } else {
      breachProbability = 0.05;
    }

    // Higher priority increases risk perception
    breachProbability = Math.min(1, breachProbability + (5 - priorityLevel) * 0.05);

    // If already resolved, no risk
    if (ticket.status.name === 'Resolvido' || ticket.status.name === 'Fechado') {
      breachProbability = 0;
    }

    let risk: 'low' | 'medium' | 'high';
    if (breachProbability >= 0.7) risk = 'high';
    else if (breachProbability >= 0.3) risk = 'medium';
    else risk = 'low';

    return {
      risk,
      estimatedResolutionHours: Math.round(remainingHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      breachProbability: Math.round(breachProbability * 100) / 100,
    };
  }

  async getStats() {
    const tickets = await this.prisma.ticket.findMany({
      where: { slaId: { not: null } },
      include: { sla: true, status: true },
    });

    let breached = 0;
    let withinSla = 0;
    const totalResolved = tickets.filter(
      (t) => t.status.name === 'Resolvido' || t.status.name === 'Fechado',
    ).length;

    for (const t of tickets) {
      if (!t.sla) continue;
      if (t.resolvedAt) {
        const resolutionHours = (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
        if (resolutionHours > t.sla.resolutionTime) {
          breached++;
        } else {
          withinSla++;
        }
      }
    }

    return {
      totalResolved,
      breached,
      withinSla,
      slaComplianceRate: totalResolved > 0 ? Math.round((withinSla / totalResolved) * 100) : 100,
    };
  }
}
