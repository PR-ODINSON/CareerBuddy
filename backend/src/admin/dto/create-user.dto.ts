import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsNumber, MinLength, Min, Max, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password (will be auto-generated if not provided)', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User bio', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  bio?: string;

  // Student-specific fields
  @ApiProperty({ description: 'University name (required for students)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  university?: string;

  @ApiProperty({ description: 'Major (required for students)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  major?: string;

  @ApiProperty({ description: 'Graduation year (required for students)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : value)
  @IsInt()
  graduationYear?: number;

  @ApiProperty({ description: 'GPA (optional for students)', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  })
  @IsNumber({}, { message: 'GPA must be a valid number' })
  @Min(0, { message: 'GPA must be at least 0' })
  @Max(4.0, { message: 'GPA must not exceed 4.0' })
  gpa?: number;

  // Counselor-specific fields
  @ApiProperty({ description: 'Specialization areas (for counselors)', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[];

  @ApiProperty({ description: 'Years of experience (for counselors)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : value)
  @IsInt()
  @Min(0)
  experience?: number;

  @ApiProperty({ description: 'Certification (for counselors)', required: false })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  certification?: string;
}
