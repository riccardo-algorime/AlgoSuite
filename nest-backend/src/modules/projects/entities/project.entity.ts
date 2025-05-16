import {Entity, Column, ManyToOne, OneToMany, JoinColumn, Index} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity';
import {User} from '../../users/entities/user.entity';
import {AttackSurface} from '../../attack-surfaces/entities/attack-surface.entity';

@Entity()
export class Project extends BaseEntity {
    @Column()
    @Index()
    name: string;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column()
    createdBy: string;

    @ManyToOne(() => User, user => user.projects)
    @JoinColumn({name: 'createdBy'})
    user: User;

    @OneToMany(() => AttackSurface, attackSurface => attackSurface.project, {cascade: true})
    attackSurfaces: AttackSurface[];
}