import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AttackSurface } from '../../attack-surfaces/entities/attack-surface.entity';

export enum AssetType {
  HOST = 'host',
  DOMAIN = 'domain',
  IP = 'ip',
  SERVICE = 'service',
  OTHER = 'other',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: AssetType,
  })
  assetType!: AssetType;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  assetMetadata?: Record<string, unknown>;

  @ManyToOne(() => AttackSurface, (surface) => surface.assets, { nullable: false })
  attackSurface!: AttackSurface;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

