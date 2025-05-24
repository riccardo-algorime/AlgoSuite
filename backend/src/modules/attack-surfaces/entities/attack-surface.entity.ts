import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Asset } from '../../assets/entities/asset.entity';

export enum SurfaceType {
  WEB = 'web',
  API = 'api',
  MOBILE = 'mobile',
  NETWORK = 'network',
  CLOUD = 'cloud',
  IOT = 'iot',
  OTHER = 'other',
}

@Entity('attack_surfaces')
export class AttackSurface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: SurfaceType,
  })
  surfaceType!: SurfaceType;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, unknown>;

  @ManyToOne(() => Project, (project) => project.attackSurfaces, { nullable: false })
  project!: Project;

  @OneToMany(() => Asset, (asset) => asset.attackSurface, { cascade: true })
  assets!: Asset[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}

