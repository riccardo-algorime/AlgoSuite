import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req, Logger, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Project } from './entities/project.entity';
import { AttackSurface } from '../attack-surfaces/entities/attack-surface.entity';
import { CreateAttackSurfaceDto } from '../attack-surfaces/dto/create-attack-surface.dto';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AttackSurfacesService } from '../attack-surfaces/attack-surfaces.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly attackSurfacesService: AttackSurfacesService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Return all projects' })
  async findAll() {
    this.logger.log('Finding all projects');
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Return the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Finding project with ID: ${id}`);
    const project = await this.projectsService.findOne(id);
    return project === null ? undefined : project;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() data: Partial<Project>, @Req() req: Request) {
    try {
      this.logger.log('Creating new project');
      this.logger.log(`Project data: ${JSON.stringify(data)}`);
      this.logger.log(`Request headers: ${JSON.stringify(req.headers)}`);

      // Extract token from authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
      }

      try {
        // Verify and decode the token
        const payload = this.jwtService.verify(token);
        this.logger.log(`Token payload: ${JSON.stringify(payload)}`);

        const userId = payload.sub;

        if (!userId) {
          throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
        }

        // Find the user
        const user = await this.usersService.findById(userId);
        if (!user) {
          throw new HttpException('User not found in database', HttpStatus.BAD_REQUEST);
        }

        // Associate the user with the project
        const projectData = {
          ...data,
          owner: user
        };

        this.logger.log(`Creating project for user: ${userId}`);
        return this.projectsService.create(projectData);
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error(`Error creating project: ${error.message}`);
      throw new HttpException(
        {
          message: `Failed to create project: ${error.message}`,
          error: error.name || 'Error',
          statusCode: HttpStatus.BAD_REQUEST
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(@Param('id') id: string, @Body() data: Partial<Project>) {
    this.logger.log(`Updating project with ID: ${id}`);
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async remove(@Param('id') id: string) {
    this.logger.log(`Removing project with ID: ${id}`);
    return this.projectsService.remove(id);
  }

  @Get(':projectId/attack-surfaces')
  @ApiOperation({ summary: 'Get all attack surfaces for a project' })
  @ApiResponse({ status: 200, description: 'Return all attack surfaces for the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findAttackSurfaces(@Param('projectId') projectId: string) {
    this.logger.log(`Finding attack surfaces for project with ID: ${projectId}`);

    // Verify that the project exists
    const project = await this.projectsService.findOne(projectId);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    return this.attackSurfacesService.findAllByProjectId(projectId);
  }

  @Post(':projectId/attack-surfaces')
  @ApiOperation({ summary: 'Create a new attack surface for a project' })
  @ApiResponse({ status: 201, description: 'Attack surface created successfully', type: AttackSurface })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async createAttackSurfaceForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createAttackSurfaceDto: CreateAttackSurfaceDto,
    @Req() req: Request,
  ): Promise<AttackSurface> {
    try {
      this.logger.log(`Creating attack surface for project with ID: ${projectId}`);
      this.logger.log(`Attack surface data: ${JSON.stringify(createAttackSurfaceDto)}`);

      // Extract token from authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
      }

      try {
        // Verify and decode the token
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        if (!userId) {
          throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
        }

        // Create the attack surface using the service method
        return this.attackSurfacesService.createForProject(projectId, createAttackSurfaceDto, userId);
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error(`Error creating attack surface: ${error.message}`);
      throw new HttpException(
        {
          message: `Failed to create attack surface: ${error.message}`,
          error: error.name || 'Error',
          statusCode: error.status || HttpStatus.BAD_REQUEST
        },
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
}
