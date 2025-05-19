import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttackSurface } from './entities/attack-surface.entity';
import { ProjectsService } from '../projects/projects.service'; // To check project ownership
import { User } from '../users/entities/user.entity'; // For CurrentUser type

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean;
}

@Injectable()
export class AttackSurfacesService {
  constructor(
    @InjectRepository(AttackSurface)
    private _attackSurfacesRepository: Repository<AttackSurface>,
    private _projectsService: ProjectsService, // Inject ProjectsService
  ) {}

  // No findAll without project context, unless for an admin role not yet defined for this service
  // async findAllAdmin(): Promise<AttackSurface[]> {
  //   return this._attackSurfacesRepository.find({ relations: ['project', 'assets'] });
  // }

  async findAllByProject(projectId: string, currentUser: CurrentUser): Promise<AttackSurface[]> {
    // First, verify user has access to the project
    await this._projectsService.findOne(projectId, currentUser);
    // findOne in ProjectsService already throws ForbiddenException if no access

    return this._attackSurfacesRepository.find({
      where: { projectId },
      relations: ['assets', 'project'], // Include project for context if needed
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<AttackSurface> {
    const attackSurface = await this._attackSurfacesRepository.findOne({
      where: { id },
      relations: ['assets', 'project'], // Include project to check its ownership
    });

    if (!attackSurface) {
      throw new NotFoundException(`Attack surface with ID ${id} not found`);
    }

    // Verify user has access to the parent project
    if (attackSurface.project) {
      // Should always have a project
      await this._projectsService.findOne(attackSurface.project.id, currentUser);
    } else {
      // This case should ideally not happen if data integrity is maintained
      throw new NotFoundException(`Parent project not found for attack surface ${id}`);
    }

    return attackSurface;
  }

  async create(
    projectId: string,
    attackSurfaceData: Partial<AttackSurface>,
    currentUser: CurrentUser,
  ): Promise<AttackSurface> {
    // Verify user has access to the project before creating an attack surface under it
    const project = await this._projectsService.findOne(projectId, currentUser);

    const attackSurfaceToCreate = {
      ...attackSurfaceData,
      projectId: project.id, // Ensure projectId is set correctly
      project: project, // Associate with the fetched project
    };

    const attackSurface = this._attackSurfacesRepository.create(attackSurfaceToCreate);
    return this._attackSurfacesRepository.save(attackSurface);
  }

  async update(
    id: string,
    attackSurfaceData: Partial<AttackSurface>,
    currentUser: CurrentUser,
  ): Promise<AttackSurface> {
    const attackSurface = await this.findOne(id, currentUser); // This already checks project ownership

    // Prevent changing the parent project (projectId) unless specific logic allows it
    if (attackSurfaceData.projectId && attackSurfaceData.projectId !== attackSurface.projectId) {
      if (!currentUser.isSuperuser && !(currentUser.roles && currentUser.roles.includes('admin'))) {
        throw new ForbiddenException('You cannot change the parent project of an attack surface.');
      }
      // If allowing change, re-verify access to the new project
      await this._projectsService.findOne(attackSurfaceData.projectId, currentUser);
    }

    this._attackSurfacesRepository.merge(attackSurface, attackSurfaceData);
    return this._attackSurfacesRepository.save(attackSurface);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    await this.findOne(id, currentUser); // Ensures project ownership before removal
    await this._attackSurfacesRepository.delete(id);
  }
}
