import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scan } from './entities/scan.entity';
import { ScansService } from './scans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Scan])],
  controllers: [],
  providers: [ScansService],
  exports: [ScansService],
})
export class ScansModule {}
