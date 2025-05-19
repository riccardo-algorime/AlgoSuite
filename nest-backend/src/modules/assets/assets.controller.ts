import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
// Uncomment when auth is implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { User } from '../users/entities/user.entity';

@ApiTags('assets')
@Controller('projects/:projectId/attack-surfaces/:attackSurfaceId/assets')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class AssetsController {
  constructor(private readonly _assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset for an attack surface' })
  @ApiResponse({ 
    status: 201, 
    description: 'Asset has been successfully created.',
    type: AssetResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Attack surface not found.' })
  async create(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Body() createAssetDto: CreateAssetDto,
    // @CurrentUser() user: User
  ): Promise<AssetResponseDto> {
    const asset = await this._assetsService.create({
      ...createAssetDto,
      attackSurfaceId,
    });
    
    return plainToInstance(AssetResponseDto, asset);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for an attack surface' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all assets for the attack surface.',
    type: [AssetResponseDto]
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  async findAll(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
  ): Promise<AssetResponseDto[]> {
    const assets = await this._assetsService.findByAttackSurface(attackSurfaceId);
    return plainToInstance(AssetResponseDto, assets);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the asset.',
    type: AssetResponseDto
  })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  async findOne(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string
  ): Promise<AssetResponseDto> {
    const asset = await this._assetsService.findOne(id);
    
    // Verify that the asset belongs to the specified attack surface
    if (asset.attackSurfaceId !== attackSurfaceId) {
      throw new Error(`Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`);
    }
    
    return plainToInstance(AssetResponseDto, asset);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ 
    status: 200, 
    description: 'Asset has been successfully updated.',
    type: AssetResponseDto
  })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  async update(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string, 
    @Body() updateAssetDto: UpdateAssetDto
  ): Promise<AssetResponseDto> {
    const asset = await this._assetsService.findOne(id);
    
    // Verify that the asset belongs to the specified attack surface
    if (asset.attackSurfaceId !== attackSurfaceId) {
      throw new Error(`Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`);
    }
    
    const updatedAsset = await this._assetsService.update(id, updateAssetDto);
    return plainToInstance(AssetResponseDto, updatedAsset);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string
  ): Promise<void> {
    const asset = await this._assetsService.findOne(id);
    
    // Verify that the asset belongs to the specified attack surface
    if (asset.attackSurfaceId !== attackSurfaceId) {
      throw new Error(`Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`);
    }
    
    await this._assetsService.remove(id);
  }
}
