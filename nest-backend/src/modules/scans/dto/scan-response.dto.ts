import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ScanTypeEnum } from '../enums/scan-type.enum';
import { ScanStatusEnum } from '../enums/scan-status.enum';
import { FindingResponseDto } from '@modules/findings/dto';
import { ScanResultResponseDto } from '@modules/scan-results/dto';

@Exclude()
export class ScanResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Scan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Target that was scanned',
    example: 'https://example.com',
  })
  target: string;

  @Expose()
  @ApiProperty({
    description: 'Type of scan',
    enum: ScanTypeEnum,
    example: 'vulnerability',
  })
  scanType: ScanTypeEnum;

  @Expose()
  @ApiProperty({
    description: 'Description of the scan',
    example: 'Vulnerability scan of the main website',
    nullable: true,
  })
  description: string | null;

  @Expose()
  @ApiProperty({
    description: 'Configuration for the scan',
    example: { depth: 2, includeSubdomains: true, excludePaths: ['/admin'] },
    nullable: true,
  })
  config: Record<string, unknown> | null;

  @Expose()
  @ApiProperty({
    description: 'Status of the scan',
    enum: ScanStatusEnum,
    example: 'completed',
  })
  status: ScanStatusEnum;

  @Expose()
  @ApiProperty({
    description: 'ID of the user who created the scan',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @Expose()
  @ApiProperty({
    description: 'Scan creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Scan last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Findings from the scan',
    type: [FindingResponseDto],
    required: false,
  })
  @Type(() => FindingResponseDto)
  findings?: FindingResponseDto[];

  @Expose()
  @ApiProperty({
    description: 'Scan result',
    type: ScanResultResponseDto,
    required: false,
  })
  @Type(() => ScanResultResponseDto)
  result?: ScanResultResponseDto;
}
