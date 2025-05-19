import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'OAuth2 compatible token login' })
  @ApiResponse({ status: 200, description: 'Token response', type: TokenResponseDto })
  login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    // return this.authService.login(loginDto);
    return Promise.resolve(undefined); // Placeholder
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token response', type: TokenResponseDto })
  refresh(@Body() refreshDto: TokenRefreshDto): Promise<TokenResponseDto> {
    // return this.authService.refresh(refreshDto);
    return Promise.resolve(undefined); // Placeholder
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user (client-side only)' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  logout(): Promise<{ detail: string }> {
    // return this.authService.logout();
    return Promise.resolve({ detail: 'Successfully logged out' });
  }

  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return the current user.' })
  me(@Req() req): Promise<any> {
    // return this.authService.getMe(req.user);
    return Promise.resolve(undefined); // Placeholder
  }
}

@ApiTags('register')
@Controller('register')
export class RegisterController {
  // constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered.' })
  register(@Body() registerDto: any): Promise<any> {
    // return this.authService.register(registerDto);
    return Promise.resolve(undefined); // Placeholder
  }
}
