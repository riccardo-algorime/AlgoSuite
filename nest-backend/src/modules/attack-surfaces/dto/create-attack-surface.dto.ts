import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { SurfaceTypeEnum } from '../enums/surface-type.enum';
import { Transform } from 'class-transformer';

export class CreateAttackSurfaceDto {
  @ApiProperty({
    description: 'Type of attack surface',
    enum: SurfaceTypeEnum,
    default: SurfaceTypeEnum.web,
    example: 'web',
  })
  @IsEnum(SurfaceTypeEnum)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  surfaceType: SurfaceTypeEnum = SurfaceTypeEnum.web;

  @ApiProperty({
    description: 'Description of the attack surface',
    example: 'Main website and customer portal',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Configuration for the attack surface',
    example: { domain: 'example.com', includeSubdomains: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
