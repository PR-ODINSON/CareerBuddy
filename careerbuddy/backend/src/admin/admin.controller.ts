import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/users')
  getUserAnalytics(@Query('period') period: string) {
    return this.adminService.getUserAnalytics(period);
  }

  @Get('analytics/resumes')
  getResumeAnalytics() {
    return this.adminService.getResumeAnalytics();
  }

  @Get('analytics/jobs')
  getJobAnalytics() {
    return this.adminService.getJobAnalytics();
  }
}
