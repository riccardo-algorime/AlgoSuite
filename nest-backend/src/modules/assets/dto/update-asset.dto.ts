import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AssetTypeEnum } from '../enums/asset-type.enum';
import { Transform } from 'class-transformer';

export class UpdateAssetDto {
  @ApiProperty({
    description: 'Asset name',
    example: 'Main Web Server',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Type of asset',
    enum: AssetTypeEnum,
    example: 'server',
    required: false,
  })
  @IsOptional()
  @IsEnum(AssetTypeEnum)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  assetType?: AssetTypeEnum;

  @ApiProperty({
    description: 'Description of the asset',
    example: 'Primary web server hosting the main website',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Metadata for the asset',
    example: { ip: '192.168.1.1', os: 'Ubuntu 20.04', services: ['nginx', 'mysql'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  assetMetadata?: Record<string, unknown>;
}
