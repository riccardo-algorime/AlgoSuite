import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { AttackSurfaceResponseDto } from '@modules/attack-surfaces/dto';

@Exclude()
export class ProjectResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Security Assessment',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Project description',
    example: 'Security assessment for the e-commerce platform',
    nullable: true,
  })
  description: string | null;

  @Expose()
  @ApiProperty({
    description: 'ID of the user who created the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  createdBy: string;

  @Expose()
  @ApiProperty({
    description: 'Project creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Project last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Attack surfaces associated with the project',
    type: [AttackSurfaceResponseDto],
    required: false,
  })
  @Type(() => AttackSurfaceResponseDto)
  attackSurfaces?: AttackSurfaceResponseDto[];
}
