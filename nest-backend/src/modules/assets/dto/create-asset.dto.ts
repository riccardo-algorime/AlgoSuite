import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { AssetTypeEnum } from '../enums/asset-type.enum';
import { Transform } from 'class-transformer';

export class CreateAssetDto {
  @ApiProperty({
    description: 'Asset name',
    example: 'Main Web Server',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of asset',
    enum: AssetTypeEnum,
    default: AssetTypeEnum.server,
    example: 'server',
  })
  @IsEnum(AssetTypeEnum)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  assetType: AssetTypeEnum = AssetTypeEnum.server;

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
