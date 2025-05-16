import {Entity, Column, ManyToOne, OneToMany, JoinColumn, Index} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity';
import {Project} from '../../projects/entities/project.entity';
import {Asset} from '../../assets/entities/asset.entity';
import {SurfaceType} from '../enums/surface-type.enum';

@Entity()
export class AttackSurface extends BaseEntity {
    @Column()
    @Index()
    projectId: string;

    @Column({
        type: 'enum',
        enum: SurfaceType,
        default: SurfaceType.WEB
    })
    @Index()
    surfaceType: SurfaceType;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'json', nullable: true})
    config: Record<string, any>;

    @ManyToOne(() => Project, project => project.attackSurfaces)
    @JoinColumn({name: 'projectId'})
    project: Project;

    @OneToMany(() => Asset, asset => asset.attackSurface, {cascade: true})
    assets: Asset[];
}