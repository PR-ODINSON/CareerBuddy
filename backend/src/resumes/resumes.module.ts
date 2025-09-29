import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { ResumeFeedback, ResumeFeedbackSchema } from './schemas/resume.schema';
import { ResumeVersion, ResumeVersionSchema } from './schemas/resume.schema';
import { AiIntegrationModule } from '../ai-integration/ai-integration.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: ResumeFeedback.name, schema: ResumeFeedbackSchema },
      { name: ResumeVersion.name, schema: ResumeVersionSchema }
    ]),
    AiIntegrationModule
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
