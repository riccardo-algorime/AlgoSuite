import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { AssetTypeEnum } from '../enums/asset-type.enum';

@Exclude()
export class AssetResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Asset ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Asset name',
    example: 'Main Web Server',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Type of asset',
    enum: AssetTypeEnum,
    example: 'server',
  })
  assetType: AssetTypeEnum;

  @Expose()
  @ApiProperty({
    description: 'Description of the asset',
    example: 'Primary web server hosting the main website',
    nullable: true,
  })
  description: string | null;

  @Expose()
  @ApiProperty({
    description: 'Metadata for the asset',
    example: { ip: '192.168.1.1', os: 'Ubuntu 20.04', services: ['nginx', 'mysql'] },
    nullable: true,
  })
  assetMetadata: Record<string, unknown> | null;

  @Expose()
  @ApiProperty({
    description: 'ID of the attack surface this asset belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  attackSurfaceId: string;

  @Expose()
  @ApiProperty({
    description: 'Asset creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Asset last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
