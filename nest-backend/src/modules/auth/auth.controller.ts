import { Body, Controller, Get, Post, Req } from '@nestjs/common';
// eslint-disable-next-line max-len
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'OAuth2 compatible token login' })
  @ApiResponse({ status: 200, description: 'Token response', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid credentials.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token response', type: TokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  refresh(@Body() refreshDto: TokenRefreshDto): Promise<TokenResponseDto> {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user (client-side only)' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  logout(): Promise<{ detail: string }> {
    return this.authService.logout();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  me(@Req() req: any): Promise<any> {
    // TODO: Use CurrentUser decorator and define user type. req.user should be populated by a guard.
    return this.authService.getMe(req.user);
    // return Promise.resolve(null as any); // Placeholder
  }
}

@ApiTags('register')
@Controller('register')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered.' })
  @ApiResponse({ status: 400, description: 'Invalid registration data.' })
  register(@Body() registerDto: RegisterDto): Promise<any> {
    // Changed to RegisterDto
    return this.authService.register(registerDto);
    // return Promise.resolve(null as any); // Placeholder
  }
}
