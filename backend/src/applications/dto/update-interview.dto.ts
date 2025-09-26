import { IsString, IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewType, InterviewStatus } from '../schemas/application.schema';

export class UpdateInterviewDto {
  @ApiProperty({ description: 'Interview type', enum: InterviewType, required: false })
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @ApiProperty({ description: 'Scheduled date and time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

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

  @ApiProperty({ description: 'Interview status', enum: InterviewStatus, required: false })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Interview feedback', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;
}
