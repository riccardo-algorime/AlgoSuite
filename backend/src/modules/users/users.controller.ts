import { Controller, Post, Get, Put, Body, Req, HttpException, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('ensure-in-db')
  @ApiOperation({ summary: 'Ensure the current user exists in the database' })
  @ApiResponse({ status: 200, description: 'User exists or was created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async ensureUserInDb(@Req() req: Request) {
    try {
      this.logger.log('Ensuring user exists in database');
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
        const email = payload.email;

        if (!userId || !email) {
          throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
        }

        // Check if user exists
        const user = await this.usersService.findById(userId);

        if (user) {
          this.logger.log(`User ${userId} already exists in database`);
          // Return user without sensitive information
          const { password, refreshToken, ...result } = user as any;
          return result;
        } else {
          // Create a basic user record if it doesn't exist
          this.logger.log(`User ${userId} not found, creating new user record`);

          const newUser = await this.usersService.create({
            id: userId,
            email: email,
            // Generate a random password since we'll never use it (user authenticated via JWT)
            password: Math.random().toString(36).slice(-10),
            role: payload.role || 'user',
          });

          this.logger.log(`Created new user ${userId} in database`);

          // Return user without sensitive information
          const { password, refreshToken, ...result } = newUser as any;
          return result;
        }
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error(`Error ensuring user in database: ${error.message}`);
      throw new HttpException(
        {
          message: `Failed to ensure user in database: ${error.message}`,
          error: error.name || 'Error',
          statusCode: HttpStatus.UNAUTHORIZED
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request) {
    const userId = (req as any).user?.sub;
    if (!userId) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Remove sensitive information
    const { password, refreshToken, ...result } = user as any;
    return result;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCurrentUser(@Req() req: Request, @Body() data: Partial<User>) {
    const userId = (req as any).user?.sub;
    if (!userId) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Prevent updating sensitive fields
    const { id, password, refreshToken, role, ...updateData } = data as any;

    // Update user
    await this.usersService.update(userId, updateData);

    // Return updated user
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Remove sensitive information
    const { password: pwd, refreshToken: rt, ...result } = user as any;
    return result;
  }
}
