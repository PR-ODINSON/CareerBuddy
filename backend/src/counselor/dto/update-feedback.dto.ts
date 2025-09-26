import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateFeedbackDto } from './create-feedback.dto';

export class UpdateFeedbackDto extends PartialType(CreateFeedbackDto) {
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;
}
