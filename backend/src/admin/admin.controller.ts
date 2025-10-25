import { Controller, Get, Put, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth data over time' })
  @ApiResponse({ status: 200, description: 'User growth chart data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 7d, 30d, 90d, 1y)' })
  getUserGrowthData(@Query('period') period: string = '30d') {
    return this.adminService.getUserGrowthData(period);
  }

  @Get('analytics/jobs')
  @ApiOperation({ summary: 'Get job analytics data' })
  @ApiResponse({ status: 200, description: 'Job analytics data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 7d, 30d, 90d, 1y)' })
  getJobAnalytics(@Query('period') period: string = '30d') {
    return this.adminService.getJobAnalytics(period);
  }

  @Get('analytics/resumes')
  @ApiOperation({ summary: 'Get resume analytics data' })
  @ApiResponse({ status: 200, description: 'Resume analytics data' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (e.g., 7d, 30d, 90d, 1y)' })
  getResumeAnalytics(@Query('period') period: string = '30d') {
    return this.adminService.getResumeAnalytics(period);
  }


  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: CreateUserDto
  ) {
    return this.adminService.updateUser(userId, updateUserDto);
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

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
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

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete admin users' })
  deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('test-db')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({ status: 200, description: 'Database connection test' })
  testDatabase() {
    return this.adminService.testDatabaseConnection();
  }
}
