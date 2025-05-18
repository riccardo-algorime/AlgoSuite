import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ScanResultSummaryDto {
  @Expose()
  @ApiProperty({
    description: 'Number of high severity findings',
    example: 5,
    default: 0,
  })
  high: number = 0;

  @Expose()
  @ApiProperty({
    description: 'Number of medium severity findings',
    example: 10,
    default: 0,
  })
  medium: number = 0;

  @Expose()
  @ApiProperty({
    description: 'Number of low severity findings',
    example: 15,
    default: 0,
  })
  low: number = 0;

  @Expose()
  @ApiProperty({
    description: 'Number of informational findings',
    example: 20,
    default: 0,
  })
  info: number = 0;
}
