import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './dto';
import { Project } from './entities/project.entity';
import { plainToInstance } from 'class-transformer';
// Uncomment when auth is implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { User } from '../users/entities/user.entity';

@ApiTags('projects')
@Controller('projects')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly _projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ 
    status: 201, 
    description: 'Project has been successfully created.',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    // @CurrentUser() user: User
  ): Promise<ProjectResponseDto> {
    // For now, hardcode a user ID until auth is implemented
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    
    const project = await this._projectsService.create({
      ...createProjectDto,
      createdBy: userId, // user.id when auth is implemented
    });
    
    return plainToInstance(ProjectResponseDto, project);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all projects for the current user.',
    type: [ProjectResponseDto]
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
    // @CurrentUser() user: User
  ): Promise<ProjectResponseDto[]> {
    // For now, hardcode a user ID until auth is implemented
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    
    const projects = await this._projectsService.findByUser(userId); // user.id when auth is implemented
    return plainToInstance(ProjectResponseDto, projects);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the project.',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this._projectsService.findOne(id);
    return plainToInstance(ProjectResponseDto, project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ 
    status: 200, 
    description: 'Project has been successfully updated.',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async update(
    @Param('id') id: string, 
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this._projectsService.update(id, updateProjectDto);
    return plainToInstance(ProjectResponseDto, project);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this._projectsService.remove(id);
  }
}
