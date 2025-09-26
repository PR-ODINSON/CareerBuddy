import { Module } from '@nestjs/common';
import { CounselorController } from './counselor.controller';
import { CounselorService } from './counselor.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { ResumesModule } from '../resumes/resumes.module';
import { JobsModule } from '../jobs/jobs.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [DatabaseModule, UsersModule, ResumesModule, JobsModule, ApplicationsModule],
  controllers: [CounselorController],
  providers: [CounselorService],
  exports: [CounselorService],
})
export class CounselorModule {}
