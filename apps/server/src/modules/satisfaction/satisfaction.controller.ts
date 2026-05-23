import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SatisfactionService } from './satisfaction.service';
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

class UpsertSatisfactionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

@ApiTags('Satisfação')
@Controller()
export class SatisfactionController {
  constructor(private readonly service: SatisfactionService) {}

  @Get('tickets/:ticketId/satisfaction')
  @ApiOperation({ summary: 'Obter avaliação do ticket' })
  async findByTicket(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.service.findByTicket(ticketId);
  }

  @Post('tickets/:ticketId/satisfaction')
  @ApiOperation({ summary: 'Avaliar ticket (1-5)' })
  async upsert(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpsertSatisfactionDto,
  ) {
    return this.service.upsert(ticketId, dto);
  }

  @Get('satisfaction/stats')
  @ApiOperation({ summary: 'Estatísticas de satisfação' })
  async stats() {
    return this.service.getStats();
  }
}
