import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { SurfaceTypeEnum } from '../enums/surface-type.enum';
import { Transform } from 'class-transformer';

export class UpdateAttackSurfaceDto {
  @ApiProperty({
    description: 'Type of attack surface',
    enum: SurfaceTypeEnum,
    example: 'web',
    required: false,
  })
  @IsOptional()
  @IsEnum(SurfaceTypeEnum)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  surfaceType?: SurfaceTypeEnum;

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
