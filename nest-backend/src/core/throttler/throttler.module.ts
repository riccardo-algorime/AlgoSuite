import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60, // time to live in seconds
        limit: 10, // max requests per ttl per user
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class AppThrottlerModule {}
