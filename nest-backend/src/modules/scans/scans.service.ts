import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Scan } from './entities/scan.entity';
import { ScanStatusEnum } from './enums/scan-status.enum';
import { User } from '../users/entities/user.entity'; // Assuming User entity path

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean;
}

@Injectable()
export class ScansService {
  private readonly logger = new Logger(ScansService.name);

  constructor(
    @InjectRepository(Scan)
    private _scansRepository: Repository<Scan>,
    // TODO: Inject a Queue service (e.g., Bull) for actual scan execution
  ) {}

  // For admins/superusers to see all scans
  findAllAdmin(): Promise<Scan[]> {
    return this._scansRepository.find({ relations: ['user', 'findings', 'result'] });
  }

  // For regular users to see their own scans
  findAllByUser(currentUser: CurrentUser): Promise<Scan[]> {
    const options: FindManyOptions<Scan> = { 
      where: { user: { id: currentUser.id } }, 
      relations: ['user', 'findings', 'result'] 
    };
    if (currentUser.isSuperuser || (currentUser.roles && currentUser.roles.includes('admin'))) {
       delete options.where;
    }
    return this._scansRepository.find(options);
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Scan> {
    const scan = await this._scansRepository.findOne({
      where: { id },
      relations: ['user', 'findings', 'result'],
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    if (!currentUser.isSuperuser && !(currentUser.roles && currentUser.roles.includes('admin')) && scan.user?.id !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to access this scan.');
    }
    return scan;
  }

  async create(scanData: Partial<Scan>, currentUser: CurrentUser): Promise<Scan> {
    const scanToCreate: Partial<Scan> = {
      ...scanData,
      createdBy: currentUser.id,
      user: currentUser as User, // May need to fetch full User entity if CurrentUser is too simple
      status: ScanStatusEnum.pending, // Default status
    };
    const scan = this._scansRepository.create(scanToCreate);
    const savedScan = await this._scansRepository.save(scan);
    
    // TODO: Trigger actual scan execution via a queue or background task
    this.logger.log(`Scan ${savedScan.id} created. TODO: Trigger actual scan execution.`);
    // For now, we might simulate by updating status after a delay or just leave as pending.
    // Example: this.triggerScanExecution(savedScan.id);

    return savedScan;
  }
  
  // Placeholder for triggering scan
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async triggerScanExecution(scanId: string): Promise<void> {
    this.logger.log(`Mock: Triggering scan execution for scan ID: ${scanId}`);
    // In a real scenario, this would add a job to a queue (e.g., Bull)
    // The job processor would then call updateStatus.
    // For now, let's simulate a quick completion for demonstration if needed, or just log.
    // Simulating an update to 'processing' then 'completed'
    // setTimeout(async () => {
    //   await this.updateStatus(scanId, ScanStatusEnum.processing, /* internal call, no user check */);
    //   this.logger.log(`Mock: Scan ${scanId} processing.`);
    //   setTimeout(async () => {
    //     await this.updateStatus(scanId, ScanStatusEnum.completed, /* internal call */);
    //     this.logger.log(`Mock: Scan ${scanId} completed.`);
    //   }, 5000); // Simulate processing time
    // }, 1000);
  }


  async update(id: string, scanData: Partial<Scan>, currentUser: CurrentUser): Promise<Scan> {
    const scan = await this.findOne(id, currentUser); // Ownership check included

    // Prevent changing critical fields like createdBy or target easily after creation by non-admins
    if ((scanData.createdBy && scanData.createdBy !== scan.createdBy) || (scanData.target && scanData.target !== scan.target)) {
        if (!currentUser.isSuperuser && !(currentUser.roles && currentUser.roles.includes('admin'))) {
            throw new ForbiddenException('You do not have permission to change critical scan details.');
        }
    }

    this._scansRepository.merge(scan, scanData);
    return this._scansRepository.save(scan);
  }

  // updateStatus might be called internally by a worker, or by an admin
  async updateStatus(id: string, status: ScanStatusEnum, currentUser?: CurrentUser): Promise<Scan> {
    let scan: Scan;
    if (currentUser) { // If called by a user, check ownership
        scan = await this.findOne(id, currentUser); // findOne already throws if not found or no permission
    } else { // Internal call (e.g., by a worker), fetch directly
        const foundScan = await this._scansRepository.findOne({ where: { id } });
        if (!foundScan) {
            throw new NotFoundException(`Scan with ID ${id} not found for internal status update.`);
        }
        scan = foundScan;
    }
    scan.status = status;
    this.logger.log(`Scan ${id} status updated to ${status}`);
    return this._scansRepository.save(scan);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    await this.findOne(id, currentUser); // Ensures ownership before removal
    await this._scansRepository.delete(id); // Use delete to avoid loading entity again
    this.logger.log(`Scan ${id} removed by user ${currentUser.id}`);
  }
}
