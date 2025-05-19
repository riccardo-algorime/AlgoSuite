import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  // Registration endpoint: remove guards if public registration is allowed
  // If only admins can create users, uncomment the next line:
  // @Roles(Role.Admin)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Roles(Role.Admin)
  findAll(): Promise<User[]> {
    return this._usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  findOne(@Param('id') id: string): Promise<User> {
    return this._usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this._usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  remove(@Param('id') id: string): Promise<User> {
    return this._usersService.remove(id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  getMe(): Promise<User> {
    // return this._usersService.getMe(req.user);
    return Promise.resolve(null as any); // Placeholder
  }

  @Post('ensure-in-db')
  @ApiOperation({ summary: 'Ensure the current user exists in the database' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  ensureInDb(@Req() req: any): Promise<User> {
    // return this._usersService.ensureInDb(req.user);
    return Promise.resolve(null as any); // Placeholder
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: any, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    // return this._usersService.updateMe(req.user, updateUserDto);
    return Promise.resolve(null as any); // Placeholder
  }
}
