import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanResult } from './entities/scan-result.entity';
import { ScansService } from '../scans/scans.service'; // To check parent scan ownership
import { User } from '../users/entities/user.entity'; // For CurrentUser type

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean;
}

@Injectable()
export class ScanResultsService {
  constructor(
    @InjectRepository(ScanResult)
    private _scanResultsRepository: Repository<ScanResult>,
    private _scansService: ScansService, // Inject ScansService
  ) {}

  // findAll might be too broad. Usually, results are fetched per scan.
  // async findAllAdmin(): Promise<ScanResult[]> { // If an admin needs all results
  //   return this._scanResultsRepository.find({ relations: ['scan', 'findings'] });
  // }

  async findOne(id: string, currentUser: CurrentUser): Promise<ScanResult> {
    const scanResult = await this._scanResultsRepository.findOne({
      where: { id },
      relations: ['scan', 'scan.user', 'findings'], // Include scan and its user for ownership check
    });

    if (!scanResult) {
      throw new NotFoundException(`Scan result with ID ${id} not found`);
    }

    if (!scanResult.scan) {
        // Data integrity issue, scan result should always have a scan
        throw new NotFoundException(`Parent scan not found for scan result ID ${id}`);
    }
    
    // Verify user has access to the parent scan
    await this._scansService.findOne(scanResult.scan.id, currentUser);
    
    return scanResult;
  }

  async findByScan(scanId: string, currentUser: CurrentUser): Promise<ScanResult> {
    // Verify user has access to the scan first
    await this._scansService.findOne(scanId, currentUser);

    const scanResult = await this._scanResultsRepository.findOne({
      where: { scan: { id: scanId } }, // TypeORM relation query
      relations: ['findings', 'scan'],
    });

    if (!scanResult) {
      // It's possible a scan exists but has no result yet.
      // Depending on requirements, this might not be an error, or could return null/empty.
      // For now, maintaining NotFoundException if no result entity exists for the scan.
      throw new NotFoundException(`Scan result for scan ID ${scanId} not found`);
    }

    return scanResult;
  }

  // Create is likely internal, called by ScansService when a scan completes.
  // If direct creation is needed, it must ensure scanId exists and user has access.
  async create(scanId: string, scanResultData: Partial<ScanResult>, currentUser: CurrentUser): Promise<ScanResult> {
    const scan = await this._scansService.findOne(scanId, currentUser); // Check access to parent scan

    const newScanResultData = { 
        ...scanResultData, 
        scanId: scan.id, // Ensure scanId is set from the verified scan
        scan: scan 
    };
    const scanResult = this._scanResultsRepository.create(newScanResultData);
    return this._scanResultsRepository.save(scanResult);
  }

  // Update is also likely internal or highly restricted.
  async update(id: string, scanResultData: Partial<ScanResult>, currentUser: CurrentUser): Promise<ScanResult> {
    const scanResult = await this.findOne(id, currentUser); // Verifies ownership via parent scan

     // Prevent changing the parent scan (scanId)
    if (scanResultData.scanId && scanResultData.scanId !== scanResult.scanId) {
        throw new ForbiddenException('Cannot change the parent scan of a scan result.');
    }

    this._scanResultsRepository.merge(scanResult, scanResultData);
    return this._scanResultsRepository.save(scanResult);
  }

  // Remove is likely internal or highly restricted.
  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    await this.findOne(id, currentUser); // Verifies ownership
    await this._scanResultsRepository.delete(id);
  }
}
