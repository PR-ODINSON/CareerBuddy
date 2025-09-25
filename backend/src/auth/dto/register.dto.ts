import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsNumber, MinLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

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
  role?: UserRole = UserRole.STUDENT;

  // Student-specific fields (required for students)
  @IsString()
  @IsNotEmpty()
  university: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsInt()
  @IsNotEmpty()
  graduationYear: number;

  @IsString()
  @IsOptional()
  currentYear?: string;

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
}
