import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Job ID to apply for' })
  @IsMongoId()
  jobId: string;

  @ApiProperty({ description: 'Resume ID to use for application', required: false })
  @IsOptional()
  @IsMongoId()
  resumeId?: string;

  @ApiProperty({ description: 'Cover letter content', required: false })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ description: 'Application notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}