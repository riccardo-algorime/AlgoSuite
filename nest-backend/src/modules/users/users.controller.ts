import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this._usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  findAll(): Promise<User[]> {
    return this._usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this._usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this._usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string): Promise<User> {
    return this._usersService.remove(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  getMe(@Req() req): Promise<User> {
    // return this._usersService.getMe(req.user);
    return Promise.resolve(undefined); // Placeholder
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Post('ensure-in-db')
  @ApiOperation({ summary: 'Ensure the current user exists in the database' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  ensureInDb(@Req() req): Promise<User> {
    // return this._usersService.ensureInDb(req.user);
    return Promise.resolve(undefined); // Placeholder
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    // return this._usersService.updateMe(req.user, updateUserDto);
    return Promise.resolve(undefined); // Placeholder
  }
}
