import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../infra/prisma/prisma.service';

@ApiTags('Tickets - Auxiliares')
@Controller()
export class TicketAuxController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('ticket-statuses')
  @ApiOperation({ summary: 'Listar status de tickets' })
  async statuses() {
    return this.prisma.ticketStatus.findMany({ orderBy: { name: 'asc' } });
  }

  @Get('ticket-priorities')
  @ApiOperation({ summary: 'Listar prioridades de tickets' })
  async priorities() {
    return this.prisma.ticketPriority.findMany({ orderBy: { level: 'asc' } });
  }


}
