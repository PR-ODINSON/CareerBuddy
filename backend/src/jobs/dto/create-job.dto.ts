import { 
  IsString, 
  IsArray, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  IsDateString, 
  IsBoolean,
  Min,
  MaxLength,
  MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel, EmploymentType, LocationType } from '../schemas/job.schema';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  company: string;

  @ApiProperty({ description: 'Job description' })
  @IsString()
  @MinLength(50)
  description: string;

  @ApiProperty({ description: 'Job requirements', type: [String] })
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty({ description: 'Job location' })
  @IsString()
  @MaxLength(100)
  location: string;

  @ApiProperty({ description: 'Location type', enum: LocationType })
  @IsEnum(LocationType)
  locationType: LocationType;

  @ApiProperty({ description: 'Minimum salary', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ description: 'Experience level required', enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ description: 'Required skills', type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Job benefits', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ description: 'Employment type', enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ description: 'External job URL', required: false })
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiProperty({ description: 'Job source', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiProperty({ description: 'Job expiration date', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ description: 'Whether job is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}