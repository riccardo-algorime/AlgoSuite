import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttackSurface } from './entities/attack-surface.entity';
import { AttackSurfacesService } from './attack-surfaces.service';
import { AttackSurfacesController } from './attack-surfaces.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttackSurface])],
  controllers: [AttackSurfacesController],
  providers: [AttackSurfacesService],
  exports: [AttackSurfacesService],
})
export class AttackSurfacesModule {}
