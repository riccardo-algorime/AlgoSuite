import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AttackSurfacesService } from './attack-surfaces.service';
import { AttackSurfaceResponseDto, AttackSurfaceWithAssetsDto } from './dto';
// import { plainToInstance } from 'class-transformer';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { User } from '../users/entities/user.entity';

@ApiTags('attack-surfaces')
@ApiBearerAuth()
@Controller('projects/:projectId/attack-surfaces')
// @UseGuards(JwtAuthGuard)
export class AttackSurfacesController {
  constructor(private readonly _attackSurfacesService: AttackSurfacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attack surface for a project' })
  @ApiResponse({
    status: 201,
    description: 'Attack surface has been successfully created.',
    type: AttackSurfaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  async create(
    @Param('projectId') projectId: string,
    // @Body() createAttackSurfaceDto: CreateAttackSurfaceDto,
    // @CurrentUser() user: User
  ): Promise<AttackSurfaceResponseDto> {
    // const attackSurface = await this._attackSurfacesService.create(
    //   projectId,
    //   createAttackSurfaceDto,
    //   user
    // );
    // return plainToInstance(AttackSurfaceResponseDto, attackSurface);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get()
  @ApiOperation({ summary: 'Get all attack surfaces for a project' })
  @ApiResponse({
    status: 200,
    description: 'Return all attack surfaces for the project.',
    type: [AttackSurfaceResponseDto],
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
  async findAll(
    @Param('projectId') projectId: string,
    // @CurrentUser() user: User
    // @Query('skip') skip?: number,
    // @Query('limit') limit?: number,
  ): Promise<AttackSurfaceResponseDto[]> {
    // const attackSurfaces = await this._attackSurfacesService.findAllByProject(
    //   projectId,
    //   user
    // );
    // return attackSurfaces.map(as => plainToInstance(AttackSurfaceResponseDto, as));
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attack surface by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the attack surface.',
    type: AttackSurfaceWithAssetsDto,
  })
  @ApiResponse({ status: 404, description: 'Attack surface not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<AttackSurfaceWithAssetsDto> {
    // const attackSurface = await this._attackSurfacesService.findOne(id, user);
    // if (attackSurface.projectId !== projectId) {
    //   throw new Error(
    //     `Attack surface with ID ${id} does not belong to project with ID ${projectId}`,
    //   );
    // }
    // return plainToInstance(AttackSurfaceWithAssetsDto, attackSurface);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attack surface' })
  @ApiResponse({
    status: 200,
    description: 'Attack surface has been successfully updated.',
    type: AttackSurfaceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Attack surface not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    // @Body() updateAttackSurfaceDto: UpdateAttackSurfaceDto,
    // @CurrentUser() user: User
  ): Promise<AttackSurfaceResponseDto> {
    // const attackSurface = await this._attackSurfacesService.findOne(id, user);
    // if (attackSurface.projectId !== projectId) {
    //   throw new Error(
    //     `Attack surface with ID ${id} does not belong to project with ID ${projectId}`,
    //   );
    // }
    // const updatedAttackSurface = await this._attackSurfacesService.update(
    //   id,
    //   updateAttackSurfaceDto,
    //   user
    // );
    // return plainToInstance(AttackSurfaceResponseDto, updatedAttackSurface);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attack surface' })
  @ApiResponse({ status: 200, description: 'Attack surface has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Attack surface not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<void> {
    // const attackSurface = await this._attackSurfacesService.findOne(id, user);
    // if (attackSurface.projectId !== projectId) {
    //   throw new Error(
    //     `Attack surface with ID ${id} does not belong to project with ID ${projectId}`,
    //   );
    // }
    // await this._attackSurfacesService.remove(id, user);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }
}
