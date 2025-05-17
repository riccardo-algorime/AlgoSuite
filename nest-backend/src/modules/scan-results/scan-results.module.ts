import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanResult } from './entities/scan-result.entity';
import { ScanResultsService } from './scan-results.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScanResult])],
  controllers: [],
  providers: [ScanResultsService],
  exports: [ScanResultsService],
})
export class ScanResultsModule {}
