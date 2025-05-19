import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanResult } from './entities/scan-result.entity';
import { ScanResultsService } from './scan-results.service';
import { ScansModule } from '../scans/scans.module'; // Import ScansModule

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanResult]),
    ScansModule, // Add ScansModule to imports
  ],
  controllers: [], // No dedicated controller for ScanResults as per current plan
  providers: [ScanResultsService],
  exports: [ScanResultsService],
})
export class ScanResultsModule {}
