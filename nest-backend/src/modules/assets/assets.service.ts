import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AttackSurfacesService } from '../attack-surfaces/attack-surfaces.service'; // To check parent ownership
import { User } from '../users/entities/user.entity'; // For CurrentUser type

// Define a simplified User type for currentUser parameter
interface CurrentUser {
  id: string;
  roles: string[];
  isSuperuser?: boolean;
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private _assetsRepository: Repository<Asset>,
    private _attackSurfacesService: AttackSurfacesService, // Inject AttackSurfacesService
  ) {}

  // No findAll without attack surface context, unless for an admin role
  // async findAllAdmin(): Promise<Asset[]> {
  //   return this._assetsRepository.find({ relations: ['attackSurface'] });
  // }

  async findAllByAttackSurface(
    attackSurfaceId: string,
    currentUser: CurrentUser,
  ): Promise<Asset[]> {
    // First, verify user has access to the parent attack surface
    await this._attackSurfacesService.findOne(attackSurfaceId, currentUser);
    // findOne in AttackSurfacesService already throws ForbiddenException if no access

    return this._assetsRepository.find({
      where: { attackSurfaceId },
      relations: ['attackSurface'], // Include parent for context if needed
    });
  }

  async findOne(id: string, currentUser: CurrentUser): Promise<Asset> {
    const asset = await this._assetsRepository.findOne({
      where: { id },
      relations: ['attackSurface', 'attackSurface.project'], // Include parent and grandparent for full check
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Verify user has access to the parent attack surface (which checks project ownership)
    if (asset.attackSurface) {
      await this._attackSurfacesService.findOne(asset.attackSurface.id, currentUser);
    } else {
      // This case should ideally not happen
      throw new NotFoundException(`Parent attack surface not found for asset ${id}`);
    }

    return asset;
  }

  async create(
    attackSurfaceId: string,
    assetData: Partial<Asset>,
    currentUser: CurrentUser,
  ): Promise<Asset> {
    // Verify user has access to the parent attack surface
    const attackSurface = await this._attackSurfacesService.findOne(attackSurfaceId, currentUser);

    const assetToCreate = {
      ...assetData,
      attackSurfaceId: attackSurface.id, // Ensure attackSurfaceId is set correctly
      attackSurface: attackSurface, // Associate with the fetched parent
    };

    const asset = this._assetsRepository.create(assetToCreate);
    return this._assetsRepository.save(asset);
  }

  async update(id: string, assetData: Partial<Asset>, currentUser: CurrentUser): Promise<Asset> {
    const asset = await this.findOne(id, currentUser); // This already checks parent ownership

    // Prevent changing the parent attack surface (attackSurfaceId) unless specific logic allows it
    if (assetData.attackSurfaceId && assetData.attackSurfaceId !== asset.attackSurfaceId) {
      if (!currentUser.isSuperuser && !(currentUser.roles && currentUser.roles.includes('admin'))) {
        throw new ForbiddenException('You cannot change the parent attack surface of an asset.');
      }
      // If allowing change, re-verify access to the new parent attack surface
      await this._attackSurfacesService.findOne(assetData.attackSurfaceId, currentUser);
    }

    this._assetsRepository.merge(asset, assetData);
    return this._assetsRepository.save(asset);
  }

  async remove(id: string, currentUser: CurrentUser): Promise<void> {
    await this.findOne(id, currentUser); // Ensures parent ownership before removal
    await this._assetsRepository.delete(id);
  }
}
