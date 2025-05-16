import {Entity, Column, ManyToOne, JoinColumn, Index} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity';
import {AttackSurface} from '../../attack-surfaces/entities/attack-surface.entity';
import {AssetType} from '../enums/asset-type.enum';

@Entity()
export class Asset extends BaseEntity {
    @Column()
    @Index()
    name: string;

    @Column({
        type: 'enum',
        enum: AssetType,
        default: AssetType.SERVER
    })
    @Index()
    assetType: AssetType;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'json', nullable: true})
    assetMetadata: Record<string, any>;

    @Column()
    @Index()
    attackSurfaceId: string;

    @ManyToOne(() => AttackSurface, attackSurface => attackSurface.assets)
    @JoinColumn({name: 'attackSurfaceId'})
    attackSurface: AttackSurface;
}