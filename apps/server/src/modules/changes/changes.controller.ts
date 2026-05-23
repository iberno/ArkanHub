import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangesService } from './changes.service';

@ApiTags('Changes')
@ApiBearerAuth()
@Controller('changes')
export class ChangesController {
  constructor(private readonly service: ChangesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: {
    title: string; description: string; requesterId: string;
    type?: string; priority?: string; riskLevel?: string; impact?: string;
    justification?: string; assigneeId?: string;
  }) { return this.service.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // Approvals
  @Post(':id/approvals')
  addApproval(@Param('id') id: string, @Body() body: { approvedBy: string; role: string; comments?: string }) {
    return this.service.addApproval(id, body);
  }

  @Patch('approvals/:approvalId')
  updateApproval(@Param('approvalId') id: string, @Body() body: { status?: string; comments?: string }) {
    return this.service.updateApproval(id, body);
  }
}
