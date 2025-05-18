# DTO Usage Guide

This document provides guidance on how to use the Data Transfer Objects (DTOs) in the NestJS application.

## What are DTOs?

Data Transfer Objects (DTOs) are objects that define how data will be sent over the network. They help to:

- Validate incoming data
- Transform data between different formats
- Document API contracts
- Provide type safety

## Types of DTOs

The application uses several types of DTOs:

1. **Request DTOs**: Used for incoming data (e.g., `CreateProjectDto`, `UpdateAssetDto`)
2. **Response DTOs**: Used for outgoing data (e.g., `ProjectResponseDto`, `AssetResponseDto`)
3. **Specialized DTOs**: Used for specific operations (e.g., `LoginDto`, `TokenRefreshDto`)

## Request DTOs

Request DTOs are used to validate incoming data from clients. They use class-validator decorators to enforce validation rules.

### Create DTOs

Create DTOs are used when creating new resources. They typically require all mandatory fields.

Example:

```typescript
// create-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Security Assessment',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Security assessment for the e-commerce platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
```

### Update DTOs

Update DTOs are used when updating existing resources. All fields are typically optional.

Example:

```typescript
// update-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Security Assessment',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Security assessment for the e-commerce platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
```

## Response DTOs

Response DTOs define how data is returned to clients. They use class-transformer decorators to control which properties are exposed.

Example:

```typescript
// project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

  // Other properties...
}
```

## Using DTOs in Controllers

DTOs are used in controllers to validate incoming requests and format outgoing responses.

```typescript
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully', type: ProjectResponseDto })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto);
  }
}
```

## Transforming Entities to DTOs

Use the `plainToInstance` function from class-transformer to convert entities to DTOs:

```typescript
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProjectsService {
  // ...

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }
}
```

## Validation Pipes

To automatically validate incoming DTOs, use the ValidationPipe:

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in the DTO
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
```

## Best Practices

1. **Keep DTOs focused**: Each DTO should have a single responsibility.
2. **Use inheritance**: Create base DTOs for common properties and extend them.
3. **Document with Swagger**: Use ApiProperty decorators to document your API.
4. **Use barrel files**: Export all DTOs from an index.ts file for cleaner imports.
5. **Validate thoroughly**: Use class-validator decorators to enforce validation rules.
6. **Transform carefully**: Use class-transformer to control which properties are exposed.
7. **Test your DTOs**: Write unit tests to ensure validation works as expected.

## Available DTOs

### Projects Module
- `CreateProjectDto`: For creating new projects
- `UpdateProjectDto`: For updating existing projects
- `ProjectResponseDto`: For returning project data

### Attack Surfaces Module
- `CreateAttackSurfaceDto`: For creating new attack surfaces
- `UpdateAttackSurfaceDto`: For updating existing attack surfaces
- `AttackSurfaceResponseDto`: For returning attack surface data
- `AttackSurfaceWithAssetsDto`: For returning attack surface data with associated assets

### Assets Module
- `CreateAssetDto`: For creating new assets
- `UpdateAssetDto`: For updating existing assets
- `AssetResponseDto`: For returning asset data

### Scans Module
- `CreateScanDto`: For creating new scans
- `UpdateScanDto`: For updating existing scans
- `ScanResponseDto`: For returning scan data

### Findings Module
- `FindingResponseDto`: For returning finding data

### Scan Results Module
- `ScanResultSummaryDto`: For returning scan result summary data
- `ScanResultResponseDto`: For returning scan result data

### Health Module
- `HealthCheckResponseDto`: For returning health check data

### Auth Module
- `LoginDto`: For user login requests
- `TokenResponseDto`: For returning authentication tokens
- `TokenRefreshDto`: For token refresh requests
- `TokenPayloadDto`: For token payload data
