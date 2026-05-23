import { Controller, Get, Post, Body, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar permissões' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar permissão' })
  async create(@Body('key') key: string, @Body('description') description?: string) {
    return this.permissionsService.create(key, description);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover permissão' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.remove(id);
  }
}
