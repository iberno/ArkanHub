import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  charter?: string;

  @ApiProperty()
  @IsUUID()
  managerId: string;

  @ApiProperty({ required: false, default: 'Draft' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, default: 'Média' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  targetEndDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimatedBudget?: number;
}
