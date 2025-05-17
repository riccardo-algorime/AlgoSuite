import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private _assetsRepository: Repository<Asset>,
  ) {}

  findAll(): Promise<Asset[]> {
    return this._assetsRepository.find();
  }

  findByAttackSurface(attackSurfaceId: string): Promise<Asset[]> {
    return this._assetsRepository.find({
      where: { attackSurfaceId },
    });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this._assetsRepository.findOne({
      where: { id },
      relations: ['attackSurface'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async create(assetData: Partial<Asset>): Promise<Asset> {
    const asset = this._assetsRepository.create(assetData);
    return this._assetsRepository.save(asset);
  }

  async update(id: string, assetData: Partial<Asset>): Promise<Asset> {
    const asset = await this.findOne(id);
    this._assetsRepository.merge(asset, assetData);
    return this._assetsRepository.save(asset);
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this._assetsRepository.remove(asset);
  }
}
