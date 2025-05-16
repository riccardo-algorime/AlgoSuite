import {Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, Index} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity';
import {User} from '../../users/entities/user.entity';
import {Finding} from '../../findings/entities/finding.entity';
import {ScanResult} from '../../scan-results/entities/scan-result.entity';
import {ScanType} from '../enums/scan-type.enum';
import {ScanStatus} from '../enums/scan-status.enum';

@Entity()
export class Scan extends BaseEntity {
    @Column()
    @Index()
    target: string;

    @Column({
        type: 'enum',
        enum: ScanType,
        default: ScanType.VULNERABILITY
    })
    @Index()
    scanType: ScanType;

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'json', nullable: true})
    config: Record<string, any>;

    @Column({
        type: 'enum',
        enum: ScanStatus,
        default: ScanStatus.PENDING
    })
    @Index()
    status: ScanStatus;

    @Column()
    createdBy: string;

    @ManyToOne(() => User, user => user.scans)
    @JoinColumn({name: 'createdBy'})
    user: User;

    @OneToMany(() => Finding, finding => finding.scan, {cascade: true})
    findings: Finding[];

    @OneToOne(() => ScanResult, scanResult => scanResult.scan, {cascade: true})
    result: ScanResult;
}