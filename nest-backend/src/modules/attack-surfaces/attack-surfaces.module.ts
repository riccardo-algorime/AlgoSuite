import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttackSurface } from './entities/attack-surface.entity';
import { AttackSurfacesService } from './attack-surfaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttackSurface])],
  controllers: [],
  providers: [AttackSurfacesService],
  exports: [AttackSurfacesService],
})
export class AttackSurfacesModule {}
