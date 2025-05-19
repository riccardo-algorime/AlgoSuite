import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { TokenResponseDto } from './dto/token-response.dto';

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
