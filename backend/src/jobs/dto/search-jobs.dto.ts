import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsInt, 
  Min,
  Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ExperienceLevel, EmploymentType, LocationType } from '@prisma/client';

export class SearchJobsDto {
  @ApiProperty({ description: 'Search query (title, description, company)', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ description: 'Location filter', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Company filter', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Experience level filter', enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ description: 'Employment type filter', enum: EmploymentType, required: false })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiProperty({ description: 'Location type filter', enum: LocationType, required: false })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiProperty({ description: 'Minimum salary filter', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  salaryMin?: number;

  @ApiProperty({ description: 'Maximum salary filter', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  salaryMax?: number;

  @ApiProperty({ description: 'Skills filter', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Sort by field', required: false, default: 'created' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created';

  @ApiProperty({ description: 'Sort order', required: false, default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}