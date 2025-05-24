import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AttackSurface } from './entities/attack-surface.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateAttackSurfaceDto } from './dto/create-attack-surface.dto';

@Injectable()
export class AttackSurfacesService {
  private readonly logger = new Logger(AttackSurfacesService.name);

  constructor(
    @InjectRepository(AttackSurface)
    private readonly attackSurfacesRepository: Repository<AttackSurface>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<AttackSurface[]> {
    return this.attackSurfacesRepository.find({ relations: ['project', 'assets'] });
  }

  async findOne(id: string): Promise<AttackSurface | undefined> {
    const surface = await this.attackSurfacesRepository.findOne({ where: { id }, relations: ['project', 'assets'] });
    return surface === null ? undefined : surface;
  }

  async create(data: Partial<AttackSurface>): Promise<AttackSurface> {
    // Omit assets if present, as TypeORM expects DeepPartial
    const { config, ...rest } = data;
    const attackSurface: DeepPartial<AttackSurface> = {
      ...rest,
      config: config !== undefined ? config : undefined
    };
    return this.attackSurfacesRepository.save(this.attackSurfacesRepository.create(attackSurface));
  }

  async update(id: string, data: Partial<AttackSurface>): Promise<AttackSurface | undefined> {
    // Omit assets if present, as TypeORM expects DeepPartial
    const { config, ...rest } = data;
    const attackSurface: DeepPartial<AttackSurface> = {
      ...rest,
      config: config !== undefined ? config : undefined
    };
    await this.attackSurfacesRepository.update(id, attackSurface as any); // DeepPartial workaround
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.attackSurfacesRepository.delete(id);
  }

  async findAllByProjectId(projectId: string): Promise<AttackSurface[]> {
    return this.attackSurfacesRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'assets']
    });
  }

  async createForProject(
    projectId: string,
    createDto: CreateAttackSurfaceDto,
    userId: string,
  ): Promise<AttackSurface> {
    this.logger.log(`Attempting to create attack surface for project ${projectId} by user ${userId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner'] // Ensure owner is loaded to check userId
    });

    if (!project) {
      this.logger.warn(`Project with ID ${projectId} not found.`);
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }

    // Authorization check: Ensure the user owns the project
    // Adjust this logic if you have more complex permission rules
    if (project.owner?.id !== userId) {
        this.logger.warn(`User ${userId} does not own project ${projectId}. Owner is ${project.owner?.id}`);
        throw new UnauthorizedException(`User does not have permission to add attack surfaces to this project.`);
    }

    // Map DTO fields to entity fields
    const newAttackSurfaceData: DeepPartial<AttackSurface> = {
      surfaceType: createDto.surface_type,
      description: createDto.description,
      config: createDto.config,
      project: project, // Link to the fetched project entity
    };

    const attackSurfaceEntity = this.attackSurfacesRepository.create(newAttackSurfaceData);
    const savedAttackSurface = await this.attackSurfacesRepository.save(attackSurfaceEntity);
    this.logger.log(`Successfully created attack surface ${savedAttackSurface.id} for project ${projectId}`);
    return savedAttackSurface;
  }
}
