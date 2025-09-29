import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounselorController } from './counselor.controller';
import { CounselorService } from './counselor.service';

// Import schemas
import { User, UserSchema } from '../users/schemas/user.schema';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { ResumeFeedback, ResumeFeedbackSchema } from '../resumes/schemas/resume.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { CounselingSession, CounselingSessionSchema } from '../common/schemas/analytics.schema';
import { CounselorAssignment, CounselorAssignmentSchema } from '../common/schemas/counselor-assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Resume.name, schema: ResumeSchema },
      { name: ResumeFeedback.name, schema: ResumeFeedbackSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema },
      { name: CounselingSession.name, schema: CounselingSessionSchema },
      { name: CounselorAssignment.name, schema: CounselorAssignmentSchema }
    ])
  ],
  controllers: [CounselorController],
  providers: [CounselorService],
  exports: [CounselorService],
})
export class CounselorModule {}
