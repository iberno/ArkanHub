import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body('name') name: string, @Body('active') active?: boolean) {
    return this.service.create({ name, active });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; active?: boolean }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // Conditions
  @Post(':id/conditions')
  addCondition(@Param('id') id: string, @Body() body: { field: string; operator: string; value: string }) {
    return this.service.addCondition(id, body);
  }

  @Delete('conditions/:conditionId')
  removeCondition(@Param('conditionId') id: string) { return this.service.removeCondition(id); }

  // Actions
  @Post(':id/actions')
  addAction(@Param('id') id: string, @Body() body: { actionType: string; payload: string }) {
    return this.service.addAction(id, body);
  }

  @Delete('actions/:actionId')
  removeAction(@Param('actionId') id: string) { return this.service.removeAction(id); }

  // Executions
  @Get('executions/all')
  findExecutions() { return this.service.findExecutions(); }

  @Post(':id/execute/:ticketId')
  execute(@Param('ticketId') ticketId: string) {
    return this.service.executeForTicket(ticketId);
  }
}
