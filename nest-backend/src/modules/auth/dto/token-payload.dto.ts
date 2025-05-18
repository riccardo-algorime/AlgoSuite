import { ApiProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
  @ApiProperty({
    description: 'Subject (user ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  sub?: string;

  @ApiProperty({
    description: 'Expiration time (Unix timestamp)',
    example: 1609459200,
    required: false,
  })
  exp?: number;
}
