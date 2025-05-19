import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { CreateScanDto, UpdateScanDto, ScanResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
// Uncomment when auth is implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { User } from '../users/entities/user.entity';

@ApiTags('scans')
@Controller('scans')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class ScansController {
  constructor(private readonly _scansService: ScansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scan' })
  @ApiResponse({ 
    status: 201, 
    description: 'Scan has been successfully created.',
    type: ScanResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Body() createScanDto: CreateScanDto,
    // @CurrentUser() user: User
  ): Promise<ScanResponseDto> {
    // For now, hardcode a user ID until auth is implemented
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    
    const scan = await this._scansService.create({
      ...createScanDto,
      createdBy: userId, // user.id when auth is implemented
    });
    
    return plainToInstance(ScanResponseDto, scan);
  }

  @Get()
  @ApiOperation({ summary: 'Get all scans for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all scans for the current user.',
    type: [ScanResponseDto]
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
    // @CurrentUser() user: User
  ): Promise<ScanResponseDto[]> {
    // For now, hardcode a user ID until auth is implemented
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    
    const scans = await this._scansService.findByUser(userId); // user.id when auth is implemented
    return plainToInstance(ScanResponseDto, scans);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scan by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the scan.',
    type: ScanResponseDto
  })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  async findOne(@Param('id') id: string): Promise<ScanResponseDto> {
    const scan = await this._scansService.findOne(id);
    return plainToInstance(ScanResponseDto, scan);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a scan' })
  @ApiResponse({ 
    status: 200, 
    description: 'Scan has been successfully updated.',
    type: ScanResponseDto
  })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  async update(
    @Param('id') id: string, 
    @Body() updateScanDto: UpdateScanDto
  ): Promise<ScanResponseDto> {
    const scan = await this._scansService.update(id, updateScanDto);
    return plainToInstance(ScanResponseDto, scan);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scan' })
  @ApiResponse({ status: 200, description: 'Scan has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Scan not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this._scansService.remove(id);
  }
}
