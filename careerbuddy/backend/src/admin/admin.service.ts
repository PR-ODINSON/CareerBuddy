import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalStudents, totalCounselors, totalJobs, totalApplications, totalResumes] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.count({ where: { role: 'COUNSELOR' } }),
        this.prisma.job.count(),
        this.prisma.application.count(),
        this.prisma.resume.count(),
      ]);

    return {
      totalUsers,
      totalStudents,
      totalCounselors,
      totalJobs,
      totalApplications,
      totalResumes,
    };
  }

  async getUserAnalytics(period: string = '30d') {
    // TODO: Implement time-series analytics
    return {
      message: 'User analytics coming soon!',
      period,
    };
  }

  async getResumeAnalytics() {
    // TODO: Implement resume analytics
    return {
      message: 'Resume analytics coming soon!',
    };
  }

  async getJobAnalytics() {
    // TODO: Implement job analytics
    return {
      message: 'Job analytics coming soon!',
    };
  }
}
