import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsArray, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // Student-specific fields
  @IsString()
  @IsOptional()
  university?: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsInt()
  @IsOptional()
  graduationYear?: number;

  // Counselor-specific fields
  @IsArray()
  @IsOptional()
  specialization?: string[];

  @IsInt()
  @IsOptional()
  experience?: number;
}
