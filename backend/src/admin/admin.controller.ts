import { Controller, Get, Put, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/users')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiResponse({ status: 200, description: 'User analytics data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 7d, 30d, 1m)' })
  getUserAnalytics(@Query('period') period: string = '30d') {
    return this.adminService.getUserAnalytics(period);
  }

  @Get('analytics/resumes')
  @ApiOperation({ summary: 'Get resume analytics' })
  @ApiResponse({ status: 200, description: 'Resume analytics data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period' })
  getResumeAnalytics(@Query('period') period: string = '30d') {
    return this.adminService.getResumeAnalytics(period);
  }

  @Get('analytics/jobs')
  @ApiOperation({ summary: 'Get job analytics' })
  @ApiResponse({ status: 200, description: 'Job analytics data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period' })
  getJobAnalytics(@Query('period') period: string = '30d') {
    return this.adminService.getJobAnalytics(period);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by role' })
  getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: UserRole
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Get('users/:id/activity')
  @ApiOperation({ summary: 'Get user activity details' })
  @ApiResponse({ status: 200, description: 'User activity data' })
  getUserActivity(@Param('id') userId: string) {
    return this.adminService.getUserActivity(userId);
  }

  @Put('jobs/:id/moderate')
  @ApiOperation({ summary: 'Moderate job posting' })
  @ApiResponse({ status: 200, description: 'Job moderation completed' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  moderateJob(
    @Param('id') jobId: string,
    @Body() moderationData: { action: 'approve' | 'reject'; reason?: string }
  ) {
    return this.adminService.moderateJob(jobId, moderationData.action, moderationData.reason);
  }
}
