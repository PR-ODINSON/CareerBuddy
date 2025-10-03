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

  @Get('dashboard-stats')
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

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  updateUserRole(
    @Param('id') userId: string,
    @Body() roleData: { role: UserRole }
  ) {
    return this.adminService.updateUserRole(userId, roleData.role);
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

  @Put('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  deactivateUser(@Param('id') userId: string) {
    return this.adminService.deactivateUser(userId);
  }

  @Put('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({ status: 200, description: 'User activated' })
  activateUser(@Param('id') userId: string) {
    return this.adminService.activateUser(userId);
  }
}
