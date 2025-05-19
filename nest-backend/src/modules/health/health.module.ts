import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
// If you have Terminus for more advanced health checks:
// import { TerminusModule } from '@nestjs/terminus';
// import { HttpModule } from '@nestjs/axios'; // if checking external services

@Module({
  // imports: [TerminusModule, HttpModule], // Uncomment if using Terminus
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
