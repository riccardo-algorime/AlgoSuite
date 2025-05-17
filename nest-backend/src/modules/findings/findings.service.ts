import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finding } from './entities/finding.entity';

@Injectable()
export class FindingsService {
  constructor(
    @InjectRepository(Finding)
    private _findingsRepository: Repository<Finding>,
  ) {}

  findAll(): Promise<Finding[]> {
    return this._findingsRepository.find();
  }

  findByScan(scanId: string): Promise<Finding[]> {
    return this._findingsRepository.find({
      where: { scanId },
    });
  }

  async findOne(id: string): Promise<Finding> {
    const finding = await this._findingsRepository.findOne({
      where: { id },
      relations: ['scan'],
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID ${id} not found`);
    }

    return finding;
  }

  async create(findingData: Partial<Finding>): Promise<Finding> {
    const finding = this._findingsRepository.create(findingData);
    return this._findingsRepository.save(finding);
  }

  async createMany(findingsData: Partial<Finding>[]): Promise<Finding[]> {
    const findings = this._findingsRepository.create(findingsData);
    return this._findingsRepository.save(findings);
  }

  async update(id: string, findingData: Partial<Finding>): Promise<Finding> {
    const finding = await this.findOne(id);
    this._findingsRepository.merge(finding, findingData);
    return this._findingsRepository.save(finding);
  }

  async remove(id: string): Promise<void> {
    const finding = await this.findOne(id);
    await this._findingsRepository.remove(finding);
  }
}
