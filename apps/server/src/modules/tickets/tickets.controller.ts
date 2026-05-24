import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tickets' })
  async findAll(
    @Query('assignedTo') assignedTo?: string,
    @Query('unassigned') unassigned?: string,
    @Query('statusName') statusName?: string,
  ) {
    return this.ticketsService.findAll({
      assignedTo,
      unassigned: unassigned === 'true',
      statusName,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Criar ticket' })
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter ticket por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ticket' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.ticketsService.update(id, dto, user.id);
  }
}
