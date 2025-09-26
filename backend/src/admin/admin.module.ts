import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { Resume, ResumeSchema } from '../resumes/schemas/resume.schema';
import { UserAnalytics, UserAnalyticsSchema } from '../common/schemas/analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Resume.name, schema: ResumeSchema },
      { name: UserAnalytics.name, schema: UserAnalyticsSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
