import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { ScanResponseDto } from './dto';
// import { plainToInstance } from 'class-transformer';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { User } from '../users/entities/user.entity';

@ApiTags('scans')
@ApiBearerAuth()
@Controller('scans')
// @UseGuards(JwtAuthGuard)
export class ScansController {
  constructor(private readonly _scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scan' })
  @ApiResponse({
    status: 201,
    description: 'Scan has been successfully created.',
    type: ScanResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create() // @Body() createScanDto: CreateScanDto,
  // @CurrentUser() user: User
  : Promise<ScanResponseDto> {
    // const scan = await this._scansService.create(
    //   createScanDto,
    //   user
    // );
    // return plainToInstance(ScanResponseDto, scan);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get()
  @ApiOperation({ summary: 'Get all scans for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all scans for the current user.',
    type: [ScanResponseDto],
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
  : Promise<ScanResponseDto[]> {
    // const scans = await this._scansService.findAllByUser(user);
    // return scans.map(scan => plainToInstance(ScanResponseDto, scan));
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scan by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the scan.',
    type: ScanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findOne(
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<ScanResponseDto> {
    // const scan = await this._scansService.findOne(id, user);
    // return plainToInstance(ScanResponseDto, scan);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a scan' })
  @ApiResponse({
    status: 200,
    description: 'Scan has been successfully updated.',
    type: ScanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(
    @Param('id') id: string,
    // @Body() updateScanDto: UpdateScanDto,
    // @CurrentUser() user: User
  ): Promise<ScanResponseDto> {
    // const scan = await this._scansService.update(id, updateScanDto, user);
    // return plainToInstance(ScanResponseDto, scan);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scan' })
  @ApiResponse({ status: 200, description: 'Scan has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async remove(
    @Param('id') id: string,
    // @CurrentUser() user: User
  ): Promise<void> {
    // await this._scansService.remove(id, user);
    throw new Error('Auth not implemented: uncomment and implement when ready.');
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get results for a specific scan' })
  @ApiResponse({ status: 200, description: 'Return the scan results.' })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getResults(@Param('id') id: string): Promise<any> {
    // return this._scansService.getResults(id);
    return Promise.resolve(undefined); // Placeholder
  }
}
