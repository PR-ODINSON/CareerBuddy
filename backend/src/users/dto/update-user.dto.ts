import { IsOptional, IsString, IsBoolean, IsInt, IsArray, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  university?: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsInt()
  @IsOptional()
  graduationYear?: number;

  @IsOptional()
  gpa?: number;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @IsArray()
  @IsOptional()
  targetRoles?: string[];

  @IsArray()
  @IsOptional()
  preferredIndustries?: string[];

  @IsArray()
  @IsOptional()
  locationPreferences?: string[];

  @IsInt()
  @IsOptional()
  salaryExpectation?: number;
}

export class UpdateCounselorProfileDto {
  @IsArray()
  @IsOptional()
  specialization?: string[];

  @IsInt()
  @IsOptional()
  experience?: number;

  @IsString()
  @IsOptional()
  certification?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsOptional()
  studentProfile?: UpdateUserProfileDto;

  @IsOptional()
  counselorProfile?: UpdateCounselorProfileDto;
}
