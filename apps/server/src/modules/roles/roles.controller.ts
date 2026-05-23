import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar papéis' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar papel' })
  async create(@Body('name') name: string, @Body('description') description?: string) {
    return this.rolesService.create(name, description);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar papel' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name?: string,
    @Body('description') description?: string,
  ) {
    return this.rolesService.update(id, { name, description });
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover papel' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':roleId/permissions/:permissionId')
  @Roles('admin')
  @ApiOperation({ summary: 'Vincular permissão ao papel' })
  async assignPermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolesService.assignPermission(roleId, permissionId);
  }

  @Delete(':roleId/permissions/:permissionId')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover permissão do papel' })
  async removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolesService.removePermission(roleId, permissionId);
  }
}
