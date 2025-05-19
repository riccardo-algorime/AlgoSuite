import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { SurfaceTypeEnum } from '../enums/surface-type.enum';

@Exclude()
export class AttackSurfaceResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Attack surface ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId!: string;

  @Expose()
  @ApiProperty({
    description: 'Type of attack surface',
    enum: SurfaceTypeEnum,
    example: 'web',
  })
  surfaceType!: SurfaceTypeEnum;

  @Expose()
  @ApiProperty({
    description: 'Description of the attack surface',
    example: 'Main website and customer portal',
    nullable: true,
  })
  description!: string | null;

  @Expose()
  @ApiProperty({
    description: 'Configuration for the attack surface',
    example: { domain: 'example.com', includeSubdomains: true },
    nullable: true,
  })
  config!: Record<string, unknown> | null;

  @Expose()
  @ApiProperty({
    description: 'Attack surface creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @Expose()
  @ApiProperty({
    description: 'Attack surface last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}
