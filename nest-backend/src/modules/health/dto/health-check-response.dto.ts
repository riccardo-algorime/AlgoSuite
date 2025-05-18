import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Status of the API',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: 'API version',
    example: 'v1',
  })
  apiVersion: string;

  @ApiProperty({
    description: 'Database connection status',
    example: true,
  })
  databaseConnected: boolean;
}
