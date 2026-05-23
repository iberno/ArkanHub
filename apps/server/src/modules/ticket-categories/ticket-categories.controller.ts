import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketCategoriesService } from './ticket-categories.service';

@ApiTags('Categorias de Ticket')
@Controller('ticket-categories')
export class TicketCategoriesController {
  constructor(private readonly service: TicketCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  async create(@Body() dto: { name: string; parentId?: string }) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { name?: string; parentId?: string },
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
