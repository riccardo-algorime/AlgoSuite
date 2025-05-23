import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { AttackSurface } from './entities/attack-surface.entity';

@Injectable()
export class AttackSurfacesService {
  constructor(
    @InjectRepository(AttackSurface)
    private readonly attackSurfacesRepository: Repository<AttackSurface>,
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
}
