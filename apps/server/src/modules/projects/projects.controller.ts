import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar projetos' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter projeto' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar projeto' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar projeto' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover projeto' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  @Post('from-ticket/:ticketId')
  @ApiOperation({ summary: 'Converter ticket em projeto' })
  convertFromTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.convertFromTicket(ticketId, dto);
  }

  // ── Phases ──────────────────────────────────────────────
  @Post(':id/phases')
  @ApiOperation({ summary: 'Adicionar fase ao projeto' })
  addPhase(@Param('id', ParseUUIDPipe) id: string, @Body() body: { name: string; description?: string; order?: number }) {
    return this.projectsService.addPhase(id, body);
  }

  @Patch('phases/:phaseId')
  @ApiOperation({ summary: 'Atualizar fase' })
  updatePhase(@Param('phaseId', ParseUUIDPipe) phaseId: string, @Body() body: { name?: string; description?: string; order?: number }) {
    return this.projectsService.updatePhase(phaseId, body);
  }

  @Delete('phases/:phaseId')
  @ApiOperation({ summary: 'Remover fase' })
  removePhase(@Param('phaseId', ParseUUIDPipe) phaseId: string) {
    return this.projectsService.removePhase(phaseId);
  }

  // ── Risks ───────────────────────────────────────────────
  @Post(':id/risks')
  @ApiOperation({ summary: 'Adicionar risco' })
  addRisk(@Param('id', ParseUUIDPipe) id: string, @Body() body: { description: string; probability?: string; impact?: string; mitigation?: string; ownerId?: string }) {
    return this.projectsService.addRisk(id, body);
  }

  @Patch('risks/:riskId')
  @ApiOperation({ summary: 'Atualizar risco' })
  updateRisk(@Param('riskId', ParseUUIDPipe) riskId: string, @Body() body: { description?: string; probability?: string; impact?: string; mitigation?: string; status?: string; ownerId?: string }) {
    return this.projectsService.updateRisk(riskId, body);
  }

  @Delete('risks/:riskId')
  @ApiOperation({ summary: 'Remover risco' })
  removeRisk(@Param('riskId', ParseUUIDPipe) riskId: string) {
    return this.projectsService.removeRisk(riskId);
  }

  // ── Stakeholders ────────────────────────────────────────
  @Post(':id/stakeholders')
  @ApiOperation({ summary: 'Adicionar stakeholder' })
  addStakeholder(@Param('id', ParseUUIDPipe) id: string, @Body() body: { userId: string; role: string }) {
    return this.projectsService.addStakeholder(id, body);
  }

  @Delete('stakeholders/:stakeholderId')
  @ApiOperation({ summary: 'Remover stakeholder' })
  removeStakeholder(@Param('stakeholderId', ParseUUIDPipe) stakeholderId: string) {
    return this.projectsService.removeStakeholder(stakeholderId);
  }

  // ── Milestones ──────────────────────────────────────────
  @Post(':id/milestones')
  @ApiOperation({ summary: 'Adicionar milestone' })
  addMilestone(@Param('id', ParseUUIDPipe) id: string, @Body() body: { name: string; description?: string; date: string }) {
    return this.projectsService.addMilestone(id, body);
  }

  @Patch('milestones/:milestoneId')
  @ApiOperation({ summary: 'Atualizar milestone' })
  updateMilestone(@Param('milestoneId', ParseUUIDPipe) milestoneId: string, @Body() body: { name?: string; description?: string; date?: string; completed?: boolean }) {
    return this.projectsService.updateMilestone(milestoneId, body);
  }

  @Delete('milestones/:milestoneId')
  @ApiOperation({ summary: 'Remover milestone' })
  removeMilestone(@Param('milestoneId', ParseUUIDPipe) milestoneId: string) {
    return this.projectsService.removeMilestone(milestoneId);
  }
}
