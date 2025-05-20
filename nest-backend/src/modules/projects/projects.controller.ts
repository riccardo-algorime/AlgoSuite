import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ProjectResponseDto } from './dto';
// import { Project } from './entities/project.entity';
// import { plainToInstance } from 'class-transformer';
// import { User } from '../users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Role } from '../auth/roles.enum';

@ApiTags('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly _projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project has been successfully created.',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create() // @Body() createProjectDto: CreateProjectDto,
  // @CurrentUser() user: User
  : Promise<ProjectResponseDto> {
    // const project = await this._projectsService.create(
    //   createProjectDto,
    //   user
    // );
    // return plainToInstance(ProjectResponseDto, project);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all projects for the current user.',
    type: [ProjectResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return',
  })
  async findAll() // @CurrentUser() user: User
  // @Query('skip') skip?: number,
  // @Query('limit') limit?: number,
  : Promise<ProjectResponseDto[]> {
    // const projects = await this._projectsService.findAllByUser(user);
    // return projects.map(project => plainToInstance(ProjectResponseDto, project));
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the project.',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<ProjectResponseDto> {
    // const project = await this._projectsService.findOne(id, user);
    // return plainToInstance(ProjectResponseDto, project);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'Project has been successfully updated.',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('id') id: string,
    // @Body() updateProjectDto: UpdateProjectDto,
    // @CurrentUser() user: User
  ): Promise<ProjectResponseDto> {
    // const project = await this._projectsService.update(id, updateProjectDto, user);
    // return plainToInstance(ProjectResponseDto, project);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<void> {
    // await this._projectsService.remove(id, user);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }
}
