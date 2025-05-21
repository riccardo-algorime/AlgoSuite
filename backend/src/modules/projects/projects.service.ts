import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ relations: ['owner', 'attackSurfaces'] });
  }

  async findOne(id: string): Promise<Project | undefined> {
    const project = await this.projectsRepository.findOne({ where: { id }, relations: ['owner', 'attackSurfaces'] });
    return project === null ? undefined : project;
  }

  async create(data: Partial<Project>): Promise<Project> {
    // Omit attackSurfaces if present, as TypeORM expects DeepPartial
    const { attackSurfaces, ...rest } = data;
    let attackSurfacesCast: DeepPartial<any>[] | undefined = undefined;
    if (attackSurfaces && Array.isArray(attackSurfaces)) {
      attackSurfacesCast = attackSurfaces.map((surface: any) => ({
        ...surface,
        config: surface.config !== undefined ? surface.config : undefined
      })) as DeepPartial<import('../attack-surfaces/entities/attack-surface.entity').AttackSurface>[];
    }
    const project: DeepPartial<Project> = { ...rest, ...(attackSurfacesCast ? { attackSurfaces: attackSurfacesCast } : {}) };
    return this.projectsRepository.save(this.projectsRepository.create(project));
  }

  async update(id: string, data: Partial<Project>): Promise<Project | undefined> {
    // Omit attackSurfaces if present, as TypeORM expects DeepPartial
    const { ...rest } = data;
    const project: DeepPartial<Project> = { ...rest };
    await this.projectsRepository.update(id, project as any); // DeepPartial workaround
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
