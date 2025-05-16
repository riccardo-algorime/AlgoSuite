import {Column, Entity, OneToMany} from 'typeorm';
import {Exclude} from 'class-transformer';
import {BaseEntity} from '../../../common/entities/base.entity';
import {Project} from '../../projects/entities/project.entity';
import {Scan} from '../../scans/entities/scan.entity';

@Entity()
export class User extends BaseEntity {
    @Column({unique: true})
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    @Exclude()
    password: string;

    @Column({default: true})
    isActive: boolean;

    @Column({default: false})
    isSuperuser: boolean;

    @Column({type: 'simple-array', default: 'user'})
    roles: string[];

    @OneToMany(() => Project, project => project.user)
    projects: Project[];

    @OneToMany(() => Scan, scan => scan.user)
    scans: Scan[];
}
