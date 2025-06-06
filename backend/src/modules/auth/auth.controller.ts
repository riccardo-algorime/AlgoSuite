import { Body, Controller, HttpCode, Post, Get, Query, Logger, Req, HttpException, HttpStatus, ValidationPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@UseGuards(JwtAuthGuard)
@Controller('v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService, private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  @Public()
  @Get('test')
  @ApiOperation({ summary: 'Test endpoint to verify public access' })
  async test() {
    return { message: 'Public endpoint is working!' };
  }

  @Public()
  @Post('/register-fullname')
  @ApiOperation({ summary: 'Special test endpoint for registering with full_name' })
  async registerWithFullName(@Req() request: Request) {
    this.logger.log('==== REGISTER WITH FULL_NAME ENDPOINT HIT ====');
    this.logger.log(`Raw request body: ${JSON.stringify(request.body)}`);

    try {
      const { email, password, full_name } = request.body;

      if (!email || !password || !full_name) {
        throw new HttpException('Email, password, and full_name are required', HttpStatus.BAD_REQUEST);
      }

      // Process the full_name into firstName and lastName
      const nameParts = full_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Create the user directly without using RegisterDto
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Generate tokens
      const payload = { sub: user.id, email: user.email, role: user.role };
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.sign(payload),
        this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
      ]);

      // Save the refresh token to the user
      await this.usersService.setRefreshToken(user.id, refreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken
      };
    } catch (error) {
      this.logger.error(`Registration with full_name failed: ${error.message}`);
      throw new HttpException(
        {
          message: `Registration failed: ${error.message}`,
          error: error.name || 'Error',
          statusCode: HttpStatus.BAD_REQUEST
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Req() request: Request) {
    // Skip all validation and directly process the raw request body
    const rawData = request.body;
    this.logger.log('==== REGISTER ENDPOINT HIT ====');
    this.logger.log(`Method: ${request.method}, URL: ${request.url}`);
    this.logger.log(`Request headers: ${JSON.stringify(request.headers)}`);
    this.logger.log(`Raw request body: ${JSON.stringify(request.body)}`);
    this.logger.log(`Register data received: ${JSON.stringify(rawData)}`);

    try {
      // Create a clean user object to pass to the service
      const userData: any = {
        email: rawData.email,
        password: rawData.password
      };

      // Handle the case where full_name is provided
      if (rawData.full_name) {
        this.logger.log(`Processing full_name: ${rawData.full_name}`);
        const nameParts = rawData.full_name.trim().split(' ');
        userData.firstName = nameParts[0] || '';
        userData.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      } else {
        // Use firstName and lastName directly if provided
        userData.firstName = rawData.firstName;
        userData.lastName = rawData.lastName;
      }

      // Basic validation
      if (!userData.email) {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }

      if (!userData.password) {
        throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
      }

      if (!userData.firstName) {
        throw new HttpException('First name is required', HttpStatus.BAD_REQUEST);
      }

      if (!userData.lastName) {
        throw new HttpException('Last name is required', HttpStatus.BAD_REQUEST);
      }

      // Log the processed user data
      this.logger.log(`Processed user data: ${JSON.stringify(userData)}`);

      // Call the auth service to register the user
      const result = await this.authService.register(userData);
      this.logger.log('Registration successful');
      return result;
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);

      // Return a more specific error response
      throw new HttpException(
        {
          message: `Registration failed: ${error.message}`,
          error: error.name || 'Error',
          statusCode: HttpStatus.BAD_REQUEST
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Query('refresh_token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request) {
    try {
      this.logger.log('Logout endpoint hit');

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

        // Call the auth service to logout the user
        return this.authService.logout(userId);
      } catch (error) {
        this.logger.error(`Token verification error: ${error.message}`);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request) {
    try {
      this.logger.log('Getting current user information');
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
          this.logger.log(`User ${userId} found in database`);
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
      this.logger.error(`Error getting current user: ${error.message}`);
      throw new HttpException(
        {
          message: `Failed to get current user: ${error.message}`,
          error: error.name || 'Error',
          statusCode: HttpStatus.UNAUTHORIZED
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
