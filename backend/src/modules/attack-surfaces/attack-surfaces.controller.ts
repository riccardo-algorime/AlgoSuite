import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttackSurface } from './entities/attack-surface.entity';
import { AttackSurfacesService } from './attack-surfaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attack-surfaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/attack-surfaces')
export class AttackSurfacesController {
  constructor(private readonly attackSurfacesService: AttackSurfacesService) {}

  @Get()
  async findAll() {
    return this.attackSurfacesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.attackSurfacesService.findOne(id);
  }

  @Post()
  async create(@Body() data: Partial<AttackSurface>) {
    return this.attackSurfacesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<AttackSurface>) {
    return this.attackSurfacesService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.attackSurfacesService.remove(id);
  }
}
