import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BiService } from './bi.service';

@ApiTags('BI')
@ApiBearerAuth()
@Controller('bi')
export class BiController {
  constructor(private readonly service: BiService) {}

  @Get('overview')
  getOverview() { return this.service.getOverview(); }

  @Get('distribution')
  getDistribution() { return this.service.getDistribution(); }

  @Get('trends/:days')
  getTrends(@Param('days') days: string) { return this.service.getTrends(Number(days) || 30); }

  @Get('trends')
  getTrendsDefault() { return this.service.getTrends(30); }

  @Get('monthly')
  getMonthly() { return this.service.getMonthlyReport(); }

  @Get('performance/departments')
  getPerfDepts() { return this.service.getPerformanceByDepartment(); }
}
