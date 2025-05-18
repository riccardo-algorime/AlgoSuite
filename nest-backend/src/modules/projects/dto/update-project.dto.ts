import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Security Assessment',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Security assessment for the e-commerce platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
