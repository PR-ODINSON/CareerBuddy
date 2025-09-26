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
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
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

  @Get('interviews/upcoming')
  @ApiOperation({ summary: 'Get upcoming interviews' })
  @ApiResponse({ status: 200, description: 'List of upcoming interviews' })
  getUpcomingInterviews(@CurrentUser('id') userId: string) {
    return this.applicationsService.getUpcomingInterviews(userId);
  }

  @Get('deadlines')
  @ApiOperation({ summary: 'Get application deadlines' })
  @ApiResponse({ status: 200, description: 'List of application deadlines' })
  getDeadlines(@CurrentUser('id') userId: string) {
    return this.applicationsService.getApplicationDeadlines(userId);
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
  applyForJob(
    @CurrentUser('id') userId: string,
    @Body() createApplicationDto: CreateApplicationDto
  ) {
    return this.applicationsService.applyForJob(userId, createApplicationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  updateApplication(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateApplicationDto
  ) {
    return this.applicationsService.updateStatus(id, updateDto, userId);
  }

  @Put(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  withdrawApplication(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.applicationsService.withdrawApplication(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  deleteApplication(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.applicationsService.deleteApplication(id, userId);
  }

  // Interview management endpoints
  @Post('interviews')
  @ApiOperation({ summary: 'Create interview (counselor/admin only)' })
  @ApiResponse({ status: 201, description: 'Interview created successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  createInterview(@Body() createInterviewDto: CreateInterviewDto) {
    return this.applicationsService.createInterview(createInterviewDto);
  }

  @Put('interviews/:id')
  @ApiOperation({ summary: 'Update interview (counselor/admin only)' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  updateInterview(
    @Param('id') id: string,
    @Body() updateDto: UpdateInterviewDto
  ) {
    return this.applicationsService.updateInterview(id, updateDto);
  }
}
