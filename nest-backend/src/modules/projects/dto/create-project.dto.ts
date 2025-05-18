import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Security Assessment',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Security assessment for the e-commerce platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
