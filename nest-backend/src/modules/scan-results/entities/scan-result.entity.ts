import {Entity, Column, OneToOne, ManyToMany, JoinColumn, JoinTable, Index} from 'typeorm';
import {BaseEntity} from '../../../common/entities/base.entity';
import {Scan} from '../../scans/entities/scan.entity';
import {Finding} from '../../findings/entities/finding.entity';

@Entity()
export class ScanResult extends BaseEntity {
    @Column()
    @Index({unique: true})
    scanId: string;

    @Column({default: 0})
    highCount: number;

    @Column({default: 0})
    mediumCount: number;

    @Column({default: 0})
    lowCount: number;

    @Column({default: 0})
    infoCount: number;

    @OneToOne(() => Scan, scan => scan.result)
    @JoinColumn({name: 'scanId'})
    scan: Scan;

    @ManyToMany(() => Finding, finding => finding.scanResults)
    @JoinTable({
        name: 'scan_result_findings',
        joinColumn: {name: 'scanResultId', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'findingId', referencedColumnName: 'id'}
    })
    findings: Finding[];
}