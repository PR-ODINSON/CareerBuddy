import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// TODO: Update these modules to use MongoDB instead of Prisma
// import { ResumesModule } from './resumes/resumes.module';
// import { JobsModule } from './jobs/jobs.module';
// import { ApplicationsModule } from './applications/applications.module';
// import { AdminModule } from './admin/admin.module';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Static file serving for uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/uploads',
    }),

    // Database
    DatabaseModule,

    // Core modules
    AuthModule,
    UsersModule,
    // TODO: Re-enable these modules after updating them to use MongoDB
    // ResumesModule,
    // JobsModule,
    // ApplicationsModule,
    // AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
