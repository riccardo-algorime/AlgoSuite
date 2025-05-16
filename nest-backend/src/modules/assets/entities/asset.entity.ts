import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AttackSurface } from '../../attack-surfaces/entities/attack-surface.entity';
import { AssetTypeEnum } from '../enums/asset-type.enum';

@Entity()
export class Asset extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: AssetTypeEnum,
    default: AssetTypeEnum.server,
  })
  @Index()
  assetType: AssetTypeEnum;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  assetMetadata: Record<string, unknown>;

  @Column()
  @Index()
  attackSurfaceId: string;

  @ManyToOne(() => AttackSurface, attackSurface => attackSurface.assets)
  @JoinColumn({ name: 'attackSurfaceId' })
  attackSurface: AttackSurface;
}
