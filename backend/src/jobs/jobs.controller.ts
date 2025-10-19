import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Query, 
  Param, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { JobsService, JobRecommendationRequest } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of jobs with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query() filters: any
  ) {
    return this.jobsService.findAll(page, limit, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search jobs with advanced filters' })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  searchJobs(@Query() searchDto: SearchJobsDto) {
    const { page = 1, limit = 20, ...filters } = searchDto;
    return this.jobsService.search(searchDto);
  }

  @Post('recommendations')
  @ApiOperation({ summary: 'Get job recommendations based on resume analysis' })
  @ApiResponse({ status: 200, description: 'Resume-based job recommendations' })
  getResumeBasedRecommendations(
    @Body() request: JobRecommendationRequest
  ) {
    return this.jobsService.getRecommendations(request);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered job recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized job recommendations' })
  getRecommendations(
    @CurrentUser('id') userId: string,
    @Query('limit') limit: number = 10
  ) {
    return this.jobsService.getRecommendations(userId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get job statistics' })
  @ApiResponse({ status: 200, description: 'Job statistics' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  getJobStats() {
    return this.jobsService.getJobStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific job details' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid job data' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  create(
    @Body() createJobDto: CreateJobDto,
    @CurrentUser('id') userId: string
  ) {
    return this.jobsService.create(createJobDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job posting' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found or unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.jobsService.update(id, updateJobDto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job posting' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found or unauthorized' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole
  ) {
    return this.jobsService.delete(id, userId, userRole);
  }
}
