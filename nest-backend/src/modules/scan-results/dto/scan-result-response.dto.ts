import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { FindingResponseDto } from '@modules/findings/dto';
import { ScanResultSummaryDto } from './scan-result-summary.dto';

@Exclude()
export class ScanResultResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Scan result ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'ID of the scan this result belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  scanId: string;

  @Expose()
  @ApiProperty({
    description: 'Findings from the scan',
    type: [FindingResponseDto],
  })
  @Type(() => FindingResponseDto)
  findings: FindingResponseDto[];

  @Expose()
  @ApiProperty({
    description: 'Summary of findings by severity',
    type: ScanResultSummaryDto,
  })
  @Type(() => ScanResultSummaryDto)
  summary: ScanResultSummaryDto;

  @Expose()
  @ApiProperty({
    description: 'Timestamp when the scan was completed',
    example: '2023-01-01T00:00:00.000Z',
  })
  completedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Scan result creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Scan result last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
