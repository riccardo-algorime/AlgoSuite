import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ScanStatusEnum } from '../enums/scan-status.enum';

export class UpdateScanDto {
  @ApiProperty({
    description: 'Description of the scan',
    example: 'Vulnerability scan of the main website',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Status of the scan',
    enum: ScanStatusEnum,
    example: 'completed',
    required: false,
  })
  @IsOptional()
  @IsEnum(ScanStatusEnum)
  status?: ScanStatusEnum;
}
