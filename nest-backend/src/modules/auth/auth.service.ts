import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenRefreshDto } from './dto/token-refresh.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'hashedPassword'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.hashedPassword && (await bcrypt.compare(pass, user.hashedPassword))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, ...result } = user; // Ensure this matches the entity property name
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const userValidationResult = await this.validateUser(loginDto.email, loginDto.password);
    if (!userValidationResult) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Re-fetch the full user entity if needed, or ensure validateUser returns enough info
    // For now, assuming userValidationResult has all necessary fields including id, email, roles
    const user = userValidationResult as User; // Cast if validateUser returns Omit<User, 'hashedPassword'>

    const payload: TokenPayloadDto = { email: user.email, sub: user.id, roles: user.roles || [] };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    });

    // TODO: Implement refresh token strategy if needed
    // const refreshToken = this.jwtService.sign(payload, {
    //   secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    //   expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    // });

    this.logger.log(`User ${user.email} logged in successfully`);
    return {
      accessToken,
      // refreshToken, // Uncomment if refresh tokens are implemented
      user: userValidationResult, // Return the validated user object (without password)
    };
  }

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { email, password, firstName, lastName } = registerDto;
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registration attempt for existing email: ${email}`);
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create new user
    const newUser = await this.usersService.create({
      email,
      password, // UsersService.create should handle hashing
      firstName,
      lastName,
      roles: ['user'], // Default role
    });

    // Log in the new user
    return this.login({ email: newUser.email, password }); // Use original password for login before it's hashed and discarded
  }

  async refresh(refreshDto: TokenRefreshDto): Promise<TokenResponseDto> {
    // This is a placeholder. A full refresh token strategy needs to be implemented.
    // It would typically involve validating the refresh token, checking it against a store,
    // and issuing new access (and possibly refresh) tokens.
    this.logger.warn(
      `Refresh token functionality not fully implemented. Received: ${refreshDto.refreshToken}`,
    );
    // For now, let's assume the refresh token itself contains enough info to re-issue an access token
    // Or, it could be that the refresh token is just a long-lived access token.
    // This is highly dependent on the chosen JWT strategy.
    // Let's throw an error to indicate it's not ready for use.
    throw new UnauthorizedException('Refresh token functionality is not yet implemented.');
    // Example of re-signing if the refresh token was just a JWT with user payload:
    // const payload = await this.verifyToken(refreshDto.refreshToken); // Assuming verifyToken can handle refresh tokens
    // const user = await this.usersService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('Invalid refresh token user not found');
    // }
    // const newAccessToken = this.jwtService.sign({ email: user.email, sub: user.id, roles: user.roles || [] }, {
    //   secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    //   expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    // });
    // return {
    //   accessToken: newAccessToken,
    //   user: { id: user.id, email: user.email, roles: user.roles, firstName: user.firstName, lastName: user.lastName } // Adjust user fields as needed
    // };
  }

  async logout(): Promise<{ detail: string }> {
    // For JWT, logout is typically handled client-side by deleting the token.
    // If using a token blacklist or server-side sessions, implement invalidation here.
    this.logger.log('Logout requested. Client should clear token.');
    return { detail: 'Successfully logged out. Please clear your token.' };
  }

  async getMe(userPayload: TokenPayloadDto): Promise<Omit<User, 'hashedPassword'> | null> {
    if (!userPayload || !userPayload.sub) {
      throw new UnauthorizedException('Invalid user payload for getMe');
    }
    const user = await this.usersService.findOne(userPayload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...result } = user;
    return result;
  }

  async getPasswordHash(password: string): Promise<string> {
    const saltRounds = 10; // Or get from config
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // This method might be used by a guard or strategy
  async verifyToken(token: string): Promise<TokenPayloadDto> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayloadDto>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      return payload;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Token verification failed', error.stack);
      } else {
        this.logger.error('Token verification failed with unknown error', error);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
