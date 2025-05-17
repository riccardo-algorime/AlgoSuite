import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanResult } from './entities/scan-result.entity';

@Injectable()
export class ScanResultsService {
  constructor(
    @InjectRepository(ScanResult)
    private _scanResultsRepository: Repository<ScanResult>,
  ) {}

  findAll(): Promise<ScanResult[]> {
    return this._scanResultsRepository.find();
  }

  async findOne(id: string): Promise<ScanResult> {
    const scanResult = await this._scanResultsRepository.findOne({
      where: { id },
      relations: ['scan', 'findings'],
    });

    if (!scanResult) {
      throw new NotFoundException(`Scan result with ID ${id} not found`);
    }

    return scanResult;
  }

  async findByScan(scanId: string): Promise<ScanResult> {
    const scanResult = await this._scanResultsRepository.findOne({
      where: { scan: { id: scanId } },
      relations: ['findings'],
    });

    if (!scanResult) {
      throw new NotFoundException(`Scan result for scan ID ${scanId} not found`);
    }

    return scanResult;
  }

  async create(scanResultData: Partial<ScanResult>): Promise<ScanResult> {
    const scanResult = this._scanResultsRepository.create(scanResultData);
    return this._scanResultsRepository.save(scanResult);
  }

  async update(id: string, scanResultData: Partial<ScanResult>): Promise<ScanResult> {
    const scanResult = await this.findOne(id);
    this._scanResultsRepository.merge(scanResult, scanResultData);
    return this._scanResultsRepository.save(scanResult);
  }

  async remove(id: string): Promise<void> {
    const scanResult = await this.findOne(id);
    await this._scanResultsRepository.remove(scanResult);
  }
}
