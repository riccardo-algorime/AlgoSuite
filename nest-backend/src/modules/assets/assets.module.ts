import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
