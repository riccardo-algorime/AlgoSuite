import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttackSurface } from './entities/attack-surface.entity';

@Injectable()
export class AttackSurfacesService {
  constructor(
    @InjectRepository(AttackSurface)
    private _attackSurfacesRepository: Repository<AttackSurface>,
  ) {}

  findAll(): Promise<AttackSurface[]> {
    return this._attackSurfacesRepository.find();
  }

  findByProject(projectId: string): Promise<AttackSurface[]> {
    return this._attackSurfacesRepository.find({
      where: { projectId },
      relations: ['assets'],
    });
  }

  async findOne(id: string): Promise<AttackSurface> {
    const attackSurface = await this._attackSurfacesRepository.findOne({
      where: { id },
      relations: ['assets'],
    });

    if (!attackSurface) {
      throw new NotFoundException(`Attack surface with ID ${id} not found`);
    }

    return attackSurface;
  }

  async create(attackSurfaceData: Partial<AttackSurface>): Promise<AttackSurface> {
    const attackSurface = this._attackSurfacesRepository.create(attackSurfaceData);
    return this._attackSurfacesRepository.save(attackSurface);
  }

  async update(id: string, attackSurfaceData: Partial<AttackSurface>): Promise<AttackSurface> {
    const attackSurface = await this.findOne(id);
    this._attackSurfacesRepository.merge(attackSurface, attackSurfaceData);
    return this._attackSurfacesRepository.save(attackSurface);
  }

  async remove(id: string): Promise<void> {
    const attackSurface = await this.findOne(id);
    await this._attackSurfacesRepository.remove(attackSurface);
  }
}
