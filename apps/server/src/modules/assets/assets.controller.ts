import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { IsString, IsOptional } from 'class-validator';

class CreateAssetDto {
  @IsString() tag: string;
  @IsString() name: string;
  @IsString() categoryId: string;
  @IsString() @IsOptional() brand?: string;
  @IsString() @IsOptional() model?: string;
  @IsString() @IsOptional() serialNumber?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() purchaseDate?: string;
  @IsString() @IsOptional() warrantyEnd?: string;
  @IsString() @IsOptional() assignedTo?: string;
  @IsString() @IsOptional() departmentId?: string;
  @IsString() @IsOptional() companyId?: string;
  @IsString() @IsOptional() notes?: string;
}

class UpdateAssetDto {
  @IsString() @IsOptional() tag?: string;
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() brand?: string;
  @IsString() @IsOptional() model?: string;
  @IsString() @IsOptional() serialNumber?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() purchaseDate?: string;
  @IsString() @IsOptional() warrantyEnd?: string;
  @IsString() @IsOptional() assignedTo?: string;
  @IsString() @IsOptional() departmentId?: string;
  @IsString() @IsOptional() companyId?: string;
  @IsString() @IsOptional() notes?: string;
}

@ApiTags('Ativos')
@Controller()
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get('assets')
  @ApiOperation({ summary: 'Listar ativos' })
  async findAll(@Query() query: { categoryId?: string; status?: string; companyId?: string; search?: string }) {
    return this.service.findAll(query);
  }

  @Get('assets/:id')
  @ApiOperation({ summary: 'Obter ativo por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post('assets')
  @ApiOperation({ summary: 'Criar ativo' })
  async create(@Body() dto: CreateAssetDto) {
    return this.service.create(dto);
  }

  @Patch('assets/:id')
  @ApiOperation({ summary: 'Atualizar ativo' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetDto) {
    return this.service.update(id, dto);
  }

  @Delete('assets/:id')
  @ApiOperation({ summary: 'Remover ativo' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
