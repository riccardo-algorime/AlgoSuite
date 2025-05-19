import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finding } from './entities/finding.entity';
import { ScansService } from '../scans/scans.service'; // To check parent scan ownership
import { User } from '../users/entities/user.entity'; // For CurrentUser type

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean;
}

@Injectable()
export class FindingsService {
  constructor(
    @InjectRepository(Finding)
    private _findingsRepository: Repository<Finding>,
    private _scansService: ScansService, // Inject ScansService
  ) {}

  // findAll might be too broad. Usually, findings are fetched per scan.
  // async findAllAdmin(): Promise<Finding[]> { // If an admin needs all findings
  //   return this._findingsRepository.find({ relations: ['scan'] });
  // }

  async findAllByScan(scanId: string, currentUser: CurrentUser): Promise<Finding[]> {
    // Verify user has access to the scan first
    await this._scansService.findOne(scanId, currentUser);

    return this._findingsRepository.find({
      where: { scanId }, // Simpler query if scanId is directly on Finding
      relations: ['scan'], // Include scan for context if needed
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Finding> {
    const finding = await this._findingsRepository.findOne({
      where: { id },
      relations: ['scan', 'scan.user'], // Include scan and its user for ownership check
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID ${id} not found`);
    }
    
    if (!finding.scan) {
        // Data integrity issue
        throw new NotFoundException(`Parent scan not found for finding ID ${id}`);
    }

    // Verify user has access to the parent scan
    await this._scansService.findOne(finding.scan.id, currentUser);
    
    return finding;
  }

  // Create is likely internal, called by ScansService or a scan worker.
  // If direct creation is needed, it must ensure scanId exists and user has access.
  async create(scanId: string, findingData: Partial<Finding>, currentUser: CurrentUser): Promise<Finding> {
    const scan = await this._scansService.findOne(scanId, currentUser); // Check access to parent scan

    const newFindingData = { 
        ...findingData, 
        scanId: scan.id, // Ensure scanId is set from the verified scan
        scan: scan 
    };
    const finding = this._findingsRepository.create(newFindingData);
    return this._findingsRepository.save(finding);
  }

  async createMany(scanId: string, findingsData: Partial<Finding>[], currentUser: CurrentUser): Promise<Finding[]> {
    const scan = await this._scansService.findOne(scanId, currentUser); // Check access

    const findingsToCreate = findingsData.map(data => ({
        ...data,
        scanId: scan.id,
        scan: scan,
    }));
    const findings = this._findingsRepository.create(findingsToCreate);
    return this._findingsRepository.save(findings);
  }

  // Update is also likely internal or highly restricted.
  async update(id: string, findingData: Partial<Finding>, currentUser: CurrentUser): Promise<Finding> {
    const finding = await this.findOne(id, currentUser); // Verifies ownership via parent scan

    // Prevent changing the parent scan (scanId)
    if (findingData.scanId && findingData.scanId !== finding.scanId) {
        throw new ForbiddenException('Cannot change the parent scan of a finding.');
    }

    this._findingsRepository.merge(finding, findingData);
    return this._findingsRepository.save(finding);
  }

  // Remove is likely internal or highly restricted.
  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    await this.findOne(id, currentUser); // Verifies ownership
    await this._findingsRepository.delete(id);
  }
}
