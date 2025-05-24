import { IsEnum, IsOptional, IsString, MaxLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SurfaceType } from '../entities/attack-surface.entity';

export class CreateAttackSurfaceDto {
  @ApiProperty({
    description: 'The type of attack surface',
    enum: SurfaceType,
    example: SurfaceType.WEB,
  })
  @IsEnum(SurfaceType)
  surface_type: SurfaceType;

  @ApiProperty({
    description: 'Optional description of the attack surface',
    required: false,
    example: 'Customer-facing web application with user authentication',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Optional configuration for the attack surface',
    required: false,
    example: { url: 'https://example.com', includeSubdomains: true },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
