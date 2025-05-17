import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan } from './entities/scan.entity';
import { ScanStatusEnum } from './enums/scan-status.enum';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private _scansRepository: Repository<Scan>,
  ) {}

  findAll(): Promise<Scan[]> {
    return this._scansRepository.find();
  }

  findByUser(userId: string): Promise<Scan[]> {
    return this._scansRepository.find({
      where: { createdBy: userId },
      relations: ['findings', 'result'],
    });
  }

  async findOne(id: string): Promise<Scan> {
    const scan = await this._scansRepository.findOne({
      where: { id },
      relations: ['findings', 'result'],
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    return scan;
  }

  async create(scanData: Partial<Scan>): Promise<Scan> {
    const scan = this._scansRepository.create({
      ...scanData,
      status: ScanStatusEnum.pending,
    });
    return this._scansRepository.save(scan);
  }

  async update(id: string, scanData: Partial<Scan>): Promise<Scan> {
    const scan = await this.findOne(id);
    this._scansRepository.merge(scan, scanData);
    return this._scansRepository.save(scan);
  }

  async updateStatus(id: string, status: ScanStatusEnum): Promise<Scan> {
    const scan = await this.findOne(id);
    scan.status = status;
    return this._scansRepository.save(scan);
  }

  async remove(id: string): Promise<void> {
    const scan = await this.findOne(id);
    await this._scansRepository.remove(scan);
  }
}
