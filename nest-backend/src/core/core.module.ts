import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggingModule } from './logging/logging.module';
import { ExceptionsModule } from './exceptions/exceptions.module';

@Module({
  imports: [ConfigModule, LoggingModule, ExceptionsModule],
  exports: [ConfigModule, LoggingModule],
})
export class CoreModule {}
