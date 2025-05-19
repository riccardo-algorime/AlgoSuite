import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity'; // Assuming User entity path

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean; // Add this if User entity has it
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private _projectsRepository: Repository<Project>,
  ) {}

  // For admins/superusers to see all projects
  findAllAdmin(): Promise<Project[]> {
    return this._projectsRepository.find({ relations: ['user'] });
  }

  // For regular users to see their own projects
  findAllByUser(currentUser: CurrentUser): Promise<Project[]> {
    const options: FindManyOptions<Project> = {
      where: { user: { id: currentUser.id } },
      relations: ['user'],
    };
    if (currentUser.isSuperuser || (currentUser.roles && currentUser.roles.includes('admin'))) {
      // If superuser/admin, remove user filter to get all projects
      delete options.where;
    }
    return this._projectsRepository.find(options);
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Project> {
    const project = await this._projectsRepository.findOne({
      where: { id },
      relations: ['attackSurfaces', 'user'], // Include user for ownership check
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (
      !currentUser.isSuperuser &&
      !(currentUser.roles && currentUser.roles.includes('admin')) &&
      project.user?.id !== currentUser.id
    ) {
      throw new ForbiddenException('You do not have permission to access this project.');
    }

    return project;
  }

  async create(projectData: Partial<Project>, currentUser: CurrentUser): Promise<Project> {
    // Ensure createdBy is set from currentUser, not directly from projectData if it exists
    const projectToCreate = {
      ...projectData,
      createdBy: currentUser.id,
      user: currentUser as User,
    };
    // Type assertion for 'user' might be needed if CurrentUser is simpler than User entity
    // Or fetch the User entity: const userEntity = await this.usersRepository.findOneBy({id: currentUser.id});
    // then: const projectToCreate = { ...projectData, user: userEntity };

    const project = this._projectsRepository.create(projectToCreate);
    return this._projectsRepository.save(project);
  }

  async update(
    id: string,
    projectData: Partial<Project>,
    currentUser: CurrentUser,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser); // findOne now includes ownership check

    // Prevent changing the owner unless by specific logic (e.g. admin transfer)
    if (
      projectData.createdBy &&
      projectData.createdBy !== project.createdBy &&
      !currentUser.isSuperuser &&
      !(currentUser.roles && currentUser.roles.includes('admin'))
    ) {
      throw new ForbiddenException('You cannot change the project owner.');
    }
    // If projectData contains 'user' object, handle similarly

    this._projectsRepository.merge(project, projectData);
    return this._projectsRepository.save(project);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    const project = await this.findOne(id, currentUser); // findOne now includes ownership check
    await this._projectsRepository.remove(project);
  }
}
