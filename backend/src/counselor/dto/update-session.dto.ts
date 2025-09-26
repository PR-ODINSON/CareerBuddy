import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { CreateSessionDto } from './create-session.dto';
import { SessionStatus } from '@prisma/client';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsInt()
  rating?: number;
}
