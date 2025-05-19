import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
 // import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
 // import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('assets')
@ApiBearerAuth()
@Controller('projects/:projectId/attack-surfaces/:attackSurfaceId/assets')
 // @UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly _assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset for an attack surface' })
  @ApiResponse({
    status: 201,
    description: 'Asset has been successfully created.',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Attack surface not found.' })
  async create(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Body() createAssetDto: CreateAssetDto,
    // @CurrentUser() user: User
  ): Promise<AssetResponseDto> {
    // const asset = await this._assetsService.create(
    //   attackSurfaceId,
    //   createAssetDto,
    //   user
    // );
    // return plainToInstance(AssetResponseDto, asset);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for an attack surface' })
  @ApiResponse({
    status: 200,
    description: 'Return all assets for the attack surface.',
    type: [AssetResponseDto],
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
    @Param('attackSurfaceId') attackSurfaceId: string,
    // @CurrentUser() user: User
    @Query('skip') skip?: number,
    @Query('limit') limit?: number
  ): Promise<AssetResponseDto[]> {
    // const assets = await this._assetsService.findAllByAttackSurface(
    //   attackSurfaceId,
    //   user
    // );
    // return assets.map(asset => plainToInstance(AssetResponseDto, asset));
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the asset.',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<AssetResponseDto> {
    // const asset = await this._assetsService.findOne(id, user);
    // if (asset.attackSurfaceId !== attackSurfaceId) {
    //   throw new Error(
    //     `Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`,
    //   );
    // }
    // return plainToInstance(AssetResponseDto, asset);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({
    status: 200,
    description: 'Asset has been successfully updated.',
    type: AssetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    // @CurrentUser() user: User
  ): Promise<AssetResponseDto> {
    // const asset = await this._assetsService.findOne(id, user);
    // if (asset.attackSurfaceId !== attackSurfaceId) {
    //   throw new Error(
    //     `Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`,
    //   );
    // }
    // const updatedAsset = await this._assetsService.update(id, updateAssetDto, user);
    // return plainToInstance(AssetResponseDto, updatedAsset);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Asset not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('attackSurfaceId') attackSurfaceId: string,
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<void> {
    // const asset = await this._assetsService.findOne(id, user);
    // if (asset.attackSurfaceId !== attackSurfaceId) {
    //   throw new Error(
    //     `Asset with ID ${id} does not belong to attack surface with ID ${attackSurfaceId}`,
    //   );
    // }
    // await this._assetsService.remove(id, user);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }
}
