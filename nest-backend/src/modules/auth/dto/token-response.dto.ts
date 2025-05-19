import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string; // Definite assignment assertion

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'User details',
    type: () => User, // Assuming User entity is defined and can be referenced
  })
  user!: Omit<User, 'password' | 'hashedPassword'>; // Definite assignment assertion
}
