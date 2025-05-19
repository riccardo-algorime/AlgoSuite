import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finding } from './entities/finding.entity';
import { FindingsService } from './findings.service';
import { ScansModule } from '../scans/scans.module'; // Import ScansModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Finding]),
    ScansModule, // Add ScansModule to imports
  ],
  controllers: [], // No dedicated controller for Findings as per current plan
  providers: [FindingsService],
  exports: [FindingsService],
})
export class FindingsModule {}
