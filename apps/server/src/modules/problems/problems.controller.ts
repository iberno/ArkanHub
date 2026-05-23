import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProblemsService } from './problems.service';

@ApiTags('Problems')
@ApiBearerAuth()
@Controller('problems')
export class ProblemsController {
  constructor(private readonly service: ProblemsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() body: {
    title: string; description: string; reporterId: string;
    impact?: string; urgency?: string; priority?: string; category?: string;
    assigneeId?: string;
  }) { return this.service.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  // Known Errors
  @Get('known-errors/all')
  findAllKnownErrors() { return this.service.findKnownErrors(); }

  @Post('known-errors')
  createKnownError(@Body() body: { problemId?: string; title: string; description: string; workaround?: string }) {
    return this.service.createKnownError(body);
  }

  @Delete('known-errors/:id')
  removeKnownError(@Param('id') id: string) { return this.service.removeKnownError(id); }
}
