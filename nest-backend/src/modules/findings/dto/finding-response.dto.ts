import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { SeverityEnum } from '../enums/severity.enum';

@Exclude()
export class FindingResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Finding ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Finding title',
    example: 'SQL Injection Vulnerability',
  })
  title: string;

  @Expose()
  @ApiProperty({
    description: 'Finding description',
    example: 'A SQL injection vulnerability was found in the login form',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'Finding severity',
    enum: SeverityEnum,
    example: 'high',
  })
  severity: SeverityEnum;

  @Expose()
  @ApiProperty({
    description: 'CVSS score',
    example: 8.5,
    nullable: true,
  })
  cvssScore: number | null;

  @Expose()
  @ApiProperty({
    description: 'CVE IDs related to the finding',
    example: ['CVE-2021-12345', 'CVE-2021-67890'],
    nullable: true,
  })
  cveIds: string[] | null;

  @Expose()
  @ApiProperty({
    description: 'Components affected by the finding',
    example: ['login-form', 'authentication-service'],
    nullable: true,
  })
  affectedComponents: string[] | null;

  @Expose()
  @ApiProperty({
    description: 'Remediation steps',
    example: 'Use parameterized queries instead of string concatenation',
    nullable: true,
  })
  remediation: string | null;

  @Expose()
  @ApiProperty({
    description: 'References to additional information',
    example: ['https://owasp.org/www-community/attacks/SQL_Injection'],
    nullable: true,
  })
  references: string[] | null;

  @Expose()
  @ApiProperty({
    description: 'ID of the scan this finding belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  scanId: string;

  @Expose()
  @ApiProperty({
    description: 'Finding creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Finding last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
