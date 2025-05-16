import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User first name', example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name', example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'User password', example: 'password123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'User active status', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'User superuser status', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isSuperuser?: boolean;

  @ApiProperty({ description: 'User roles', example: ['user'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
