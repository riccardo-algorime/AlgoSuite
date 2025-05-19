import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint to verify API and database connection' })
  @ApiResponse({
    status: 200,
    description: 'Health check response.',
    schema: {
      example: {
        status: 'ok',
        api_version: '1.0.0',
        database_connected: true,
      },
    },
  })
  healthCheck(): Promise<any> {
    // return this.healthService.check();
    return Promise.resolve({
      status: 'ok',
      api_version: '1.0.0',
      database_connected: true,
    }); // Placeholder
  }
}
