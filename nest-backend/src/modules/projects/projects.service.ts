import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private _projectsRepository: Repository<Project>,
  ) {}

  findAll(): Promise<Project[]> {
    return this._projectsRepository.find();
  }

  findByUser(userId: string): Promise<Project[]> {
    return this._projectsRepository.find({
      where: { createdBy: userId },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this._projectsRepository.findOne({
      where: { id },
      relations: ['attackSurfaces'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async create(projectData: Partial<Project>): Promise<Project> {
    const project = this._projectsRepository.create(projectData);
    return this._projectsRepository.save(project);
  }

  async update(id: string, projectData: Partial<Project>): Promise<Project> {
    const project = await this.findOne(id);
    this._projectsRepository.merge(project, projectData);
    return this._projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this._projectsRepository.remove(project);
  }
}
