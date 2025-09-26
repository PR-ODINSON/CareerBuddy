import { IsMongoId, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStudentDto {
  @ApiProperty({ description: 'Counselor ID to assign student to' })
  @IsMongoId()
  counselorId: string;

  @ApiProperty({ description: 'Student ID to be assigned' })
  @IsMongoId()
  studentId: string;

  @ApiProperty({ description: 'Assignment notes or reason', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Assignment expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
