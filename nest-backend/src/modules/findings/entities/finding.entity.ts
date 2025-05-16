import { Entity, Column, ManyToOne, ManyToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Scan } from '../../scans/entities/scan.entity';
import { ScanResult } from '../../scan-results/entities/scan-result.entity';
import { SeverityEnum } from '../enums/severity.enum';

@Entity()
export class Finding extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SeverityEnum,
    default: SeverityEnum.low,
  })
  @Index()
  severity: SeverityEnum;

  @Column({ type: 'float', nullable: true })
  cvssScore: number;

  @Column({ type: 'json', nullable: true })
  cveIds: string[];

  @Column({ type: 'json', nullable: true })
  affectedComponents: string[];

  @Column({ type: 'text', nullable: true })
  remediation: string;

  @Column({ type: 'json', nullable: true })
  references: string[];

  @Column()
  scanId: string;

  @ManyToOne(() => Scan, scan => scan.findings)
  @JoinColumn({ name: 'scanId' })
  scan: Scan;

  @ManyToMany(() => ScanResult, scanResult => scanResult.findings)
  scanResults: ScanResult[];
}
