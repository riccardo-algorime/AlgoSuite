import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ScanTypeEnum } from '../enums/scan-type.enum';
import { Transform } from 'class-transformer';

export class CreateScanDto {
  @ApiProperty({
    description: 'Target to scan',
    example: 'https://example.com',
  })
  @IsNotEmpty()
  @IsString()
  target: string;

  @ApiProperty({
    description: 'Type of scan',
    enum: ScanTypeEnum,
    default: ScanTypeEnum.vulnerability,
    example: 'vulnerability',
  })
  @IsEnum(ScanTypeEnum)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  scanType: ScanTypeEnum = ScanTypeEnum.vulnerability;

  @ApiProperty({
    description: 'Description of the scan',
    example: 'Vulnerability scan of the main website',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Configuration for the scan',
    example: { depth: 2, includeSubdomains: true, excludePaths: ['/admin'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
