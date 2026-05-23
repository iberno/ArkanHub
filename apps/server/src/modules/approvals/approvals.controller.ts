import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';

@ApiTags('Approvals')
@Controller()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  // ─── Flows ───────────────────────────────────────────

  @Get('approval-flows')
  @ApiOperation({ summary: 'Listar fluxos de aprovação' })
  async findAllFlows() {
    return this.approvalsService.findAllFlows();
  }

  @Get('approval-flows/:id')
  @ApiOperation({ summary: 'Obter fluxo de aprovação' })
  async findFlow(@Param('id', ParseUUIDPipe) id: string) {
    return this.approvalsService.findFlow(id);
  }

  @Post('approval-flows')
  @ApiOperation({ summary: 'Criar fluxo de aprovação' })
  async createFlow(@Body() body: { name: string; entityType: string }) {
    return this.approvalsService.createFlow(body);
  }

  @Patch('approval-flows/:id')
  @ApiOperation({ summary: 'Atualizar fluxo de aprovação' })
  async updateFlow(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name?: string; entityType?: string },
  ) {
    return this.approvalsService.updateFlow(id, body);
  }

  @Delete('approval-flows/:id')
  @ApiOperation({ summary: 'Remover fluxo de aprovação' })
  async removeFlow(@Param('id', ParseUUIDPipe) id: string) {
    return this.approvalsService.removeFlow(id);
  }

  // ─── Steps ───────────────────────────────────────────

  @Post('approval-flows/:flowId/steps')
  @ApiOperation({ summary: 'Adicionar etapa ao fluxo' })
  async addStep(
    @Param('flowId', ParseUUIDPipe) flowId: string,
    @Body() body: { stepOrder: number; approverType: string },
  ) {
    return this.approvalsService.addStep(flowId, body);
  }

  @Delete('approval-flows/:flowId/steps/:stepId')
  @ApiOperation({ summary: 'Remover etapa do fluxo' })
  async removeStep(
    @Param('flowId', ParseUUIDPipe) flowId: string,
    @Param('stepId', ParseUUIDPipe) stepId: string,
  ) {
    return this.approvalsService.removeStep(flowId, stepId);
  }

  // ─── Requests ────────────────────────────────────────

  @Get('tickets/:ticketId/approvals')
  @ApiOperation({ summary: 'Listar solicitações de aprovação de um ticket' })
  async findRequestsByTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.approvalsService.findRequestsByTicket(ticketId);
  }

  @Post('tickets/:ticketId/approvals')
  @ApiOperation({ summary: 'Criar solicitação de aprovação para um ticket' })
  async createRequest(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body('flowId') flowId: string,
  ) {
    return this.approvalsService.createRequest(ticketId, flowId);
  }

  @Post('approval-requests/:id/approve')
  @ApiOperation({ summary: 'Aprovar solicitação' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
    @Body('comments') comments?: string,
  ) {
    return this.approvalsService.approve(id, userId, comments);
  }

  @Post('approval-requests/:id/reject')
  @ApiOperation({ summary: 'Rejeitar solicitação' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
    @Body('comments') comments?: string,
  ) {
    return this.approvalsService.reject(id, userId, comments);
  }
}
