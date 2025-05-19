import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttackSurface } from './entities/attack-surface.entity';
import { AttackSurfacesService } from './attack-surfaces.service';
import { AttackSurfacesController } from './attack-surfaces.controller';
import { ProjectsModule } from '../projects/projects.module'; // Import ProjectsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([AttackSurface]),
    ProjectsModule, // Add ProjectsModule to imports
  ],
  controllers: [AttackSurfacesController], // Add AttackSurfacesController
  providers: [AttackSurfacesService],
  exports: [AttackSurfacesService],
})
export class AttackSurfacesModule {}
