import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
  ) {}

  async findAll(): Promise<Asset[]> {
    return this.assetsRepository.find({ relations: ['attackSurface'] });
  }

  async findOne(id: string): Promise<Asset | undefined> {
    const asset = await this.assetsRepository.findOne({ where: { id }, relations: ['attackSurface'] });
    return asset === null ? undefined : asset;
  }

  async create(data: Partial<Asset>): Promise<Asset> {
    // Omit attackSurface if present, as TypeORM expects DeepPartial
    const { assetMetadata, ...rest } = data;
    const asset: DeepPartial<Asset> = {
      ...rest,
      assetMetadata: assetMetadata !== undefined ? assetMetadata : undefined
    };
    return this.assetsRepository.save(this.assetsRepository.create(asset));
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset | undefined> {
    // Omit attackSurface if present, as TypeORM expects DeepPartial
    const { assetMetadata, ...rest } = data;
    const asset: DeepPartial<Asset> = {
      ...rest,
      assetMetadata: assetMetadata !== undefined ? assetMetadata : undefined
    };
    await this.assetsRepository.update(id, asset as any); // DeepPartial workaround
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.assetsRepository.delete(id);
  }
}
