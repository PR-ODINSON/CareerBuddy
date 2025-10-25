import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from './schemas/application.schema';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user applications' })
  @ApiResponse({ status: 200, description: 'List of user applications' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ApplicationStatus
  ) {
    return this.applicationsService.findAllByUser(userId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({ status: 200, description: 'Application statistics' })
  getStats(@CurrentUser('id') userId: string) {
    return this.applicationsService.getApplicationStats(userId);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get application timeline' })
  @ApiResponse({ status: 200, description: 'Application timeline' })
  getTimeline(
    @Param('id') applicationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.applicationsService.getTimeline(applicationId, userId);
  }

  @Get('by-job/:jobId')
  @ApiOperation({ summary: 'Get all applications for a specific job (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of job applications' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllByJob(@Param('jobId') jobId: string) {
    return this.applicationsService.findAllByJob(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific application' })
  @ApiResponse({ status: 200, description: 'Application details' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 409, description: 'Already applied for this job' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createApplicationDto: CreateApplicationDto
  ) {
    return this.applicationsService.create(userId, createApplicationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateApplicationDto
  ) {
    return this.applicationsService.update(id, userId, updateDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Application status updated' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() statusData: { status: ApplicationStatus }
  ) {
    return this.applicationsService.updateStatus(id, statusData.status, userRole, userId);
  }

  @Put(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  withdraw(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.applicationsService.withdraw(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.applicationsService.remove(id, userId);
  }

}
