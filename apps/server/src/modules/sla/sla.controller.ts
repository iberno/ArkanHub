import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SlaService } from './sla.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('SLA')
@Controller('slas')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar SLAs' })
  async findAll() {
    return this.slaService.findAll();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar SLA' })
  async create(@Body() body: { name: string; responseTime: number; resolutionTime: number }) {
    return this.slaService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar SLA' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<{ name: string; responseTime: number; resolutionTime: number }>,
  ) {
    return this.slaService.update(id, body);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calcular SLA para um ticket' })
  async calculate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('priority') priority: string,
  ) {
    return this.slaService.calculateDeadline(id, priority);
  }
}
