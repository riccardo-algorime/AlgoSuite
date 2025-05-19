import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AttackSurfacesModule } from '../attack-surfaces/attack-surfaces.module'; // Import AttackSurfacesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    AttackSurfacesModule, // Add AttackSurfacesModule to imports
  ],
  controllers: [AssetsController], // Add AssetsController
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
