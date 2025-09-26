import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FeedbackType, FeedbackSeverity } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Resume ID to provide feedback for' })
  @IsMongoId()
  resumeId: string;

  @ApiProperty({ description: 'Student ID (optional, will be inferred from resume)' })
  @IsOptional()
  @IsMongoId()
  studentId?: string;

  @ApiProperty({ description: 'Type of feedback', enum: FeedbackType })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ description: 'Feedback category (e.g., formatting, content, skills)' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Feedback title/summary' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed feedback description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Severity of the feedback', enum: FeedbackSeverity })
  @IsEnum(FeedbackSeverity)
  severity: FeedbackSeverity;

  @ApiProperty({ description: 'Suggestion for improvement', required: false })
  @IsOptional()
  @IsString()
  suggestion?: string;

  @ApiProperty({ description: 'Line number in resume for specific feedback', required: false })
  @IsOptional()
  @IsInt()
  lineNumber?: number;

  @ApiProperty({ description: 'Resume section this feedback applies to', required: false })
  @IsOptional()
  @IsString()
  section?: string;
}
