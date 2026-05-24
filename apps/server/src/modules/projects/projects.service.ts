import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { tickets: true, risks: true, milestones: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        phases: { orderBy: { order: 'asc' } },
        risks: {
          include: { owner: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        stakeholders: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        milestones: { orderBy: { date: 'asc' } },
        tickets: {
          include: {
            status: true,
            priority: true,
            requester: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
        },
        _count: { select: { tickets: true, risks: true, milestones: true } },
      },
    });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        charter: dto.charter,
        managerId: dto.managerId,
        status: dto.status || 'Draft',
        priority: dto.priority || 'Média',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetEndDate: dto.targetEndDate ? new Date(dto.targetEndDate) : undefined,
        estimatedBudget: dto.estimatedBudget,
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.charter !== undefined) data.charter = dto.charter;
    if (dto.managerId !== undefined) data.managerId = dto.managerId;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.estimatedBudget !== undefined) data.estimatedBudget = dto.estimatedBudget;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.targetEndDate !== undefined) data.targetEndDate = new Date(dto.targetEndDate);

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Projeto não encontrado');
    await this.prisma.project.delete({ where: { id } });
  }

  async convertFromTicket(ticketId: string, dto: CreateProjectDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { status: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description || ticket.description,
        charter: `Ticket origem: ${ticket.protocol} — ${ticket.title}`,
        managerId: dto.managerId,
        status: 'Planned',
        priority: dto.priority || 'Média',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetEndDate: dto.targetEndDate ? new Date(dto.targetEndDate) : undefined,
        estimatedBudget: dto.estimatedBudget,
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { projectId: project.id },
    });

    return project;
  }

  async addPhase(projectId: string, data: { name: string; description?: string; order?: number; startDate?: string; endDate?: string }) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projeto não encontrado');

    return this.prisma.projectPhase.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        order: data.order ?? 0,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async updatePhase(phaseId: string, data: { name?: string; description?: string; order?: number; startDate?: string; endDate?: string }) {
    const phase = await this.prisma.projectPhase.findUnique({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Fase não encontrada');

    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async removePhase(phaseId: string) {
    const phase = await this.prisma.projectPhase.findUnique({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Fase não encontrada');
    await this.prisma.projectPhase.delete({ where: { id: phaseId } });
  }

  async addRisk(projectId: string, data: { description: string; probability?: string; impact?: string; mitigation?: string; ownerId?: string }) {
    return this.prisma.projectRisk.create({
      data: { projectId, ...data },
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  async updateRisk(riskId: string, data: { description?: string; probability?: string; impact?: string; mitigation?: string; status?: string; ownerId?: string }) {
    return this.prisma.projectRisk.update({
      where: { id: riskId },
      data,
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  async removeRisk(riskId: string) {
    await this.prisma.projectRisk.delete({ where: { id: riskId } });
  }

  async addStakeholder(projectId: string, data: { userId: string; role: string }) {
    return this.prisma.projectStakeholder.create({
      data: { projectId, ...data },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeStakeholder(stakeholderId: string) {
    await this.prisma.projectStakeholder.delete({ where: { id: stakeholderId } });
  }

  async addMilestone(projectId: string, data: { name: string; description?: string; date: string }) {
    return this.prisma.projectMilestone.create({
      data: { projectId, name: data.name, description: data.description, date: new Date(data.date) },
    });
  }

  async updateMilestone(milestoneId: string, data: { name?: string; description?: string; date?: string; completed?: boolean }) {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.completed === true) updateData.completedAt = new Date();
    if (data.completed === false) updateData.completedAt = null;
    return this.prisma.projectMilestone.update({ where: { id: milestoneId }, data: updateData });
  }

  async removeMilestone(milestoneId: string) {
    await this.prisma.projectMilestone.delete({ where: { id: milestoneId } });
  }
}
