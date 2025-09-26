import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsInt, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewType } from '../schemas/application.schema';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Application ID' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  applicationId: string;

  @ApiProperty({ description: 'Interview type', enum: InterviewType })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsDateString()
  scheduledAt: Date;

  @ApiProperty({ description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiProperty({ description: 'Interview location or meeting link', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Interviewer name', required: false })
  @IsOptional()
  @IsString()
  interviewerName?: string;

  @ApiProperty({ description: 'Interviewer email', required: false })
  @IsOptional()
  @IsString()
  interviewerEmail?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
