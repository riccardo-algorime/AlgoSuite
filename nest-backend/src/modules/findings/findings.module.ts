import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finding } from './entities/finding.entity';
import { FindingsService } from './findings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Finding])],
  controllers: [],
  providers: [FindingsService],
  exports: [FindingsService],
})
export class FindingsModule {}
