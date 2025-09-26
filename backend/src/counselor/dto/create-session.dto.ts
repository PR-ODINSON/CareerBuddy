import { IsString, IsEnum, IsOptional, IsInt, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '@prisma/client';

export class CreateSessionDto {
  @ApiProperty({ description: 'Student ID for the session' })
  @IsMongoId()
  studentId: string;

  @ApiProperty({ description: 'Session title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Session description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of session', enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: 'Session duration in minutes' })
  @IsInt()
  duration: number;

  @ApiProperty({ description: 'Session notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
