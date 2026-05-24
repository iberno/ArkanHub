import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'Não consigo acessar o sistema' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Ao tentar fazer login...' })
  @IsString()
  description: string;

  @ApiProperty()
  @IsUUID()
  requesterId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  onBehalfOfId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiProperty()
  @IsUUID()
  statusId: string;

  @ApiProperty()
  @IsUUID()
  priorityId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsString({ each: true })
  @IsOptional()
  assetIds?: string[];
}
