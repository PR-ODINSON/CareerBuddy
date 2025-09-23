import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.applicationsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.applicationsService.findOne(id, userId);
  }

  @Post()
  apply(
    @CurrentUser('id') userId: string,
    @Body() applicationData: { jobId: string; resumeId?: string; coverLetter?: string },
  ) {
    return this.applicationsService.apply(
      userId,
      applicationData.jobId,
      applicationData.resumeId,
      applicationData.coverLetter,
    );
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateData: { status: string; notes?: string },
  ) {
    return this.applicationsService.updateStatus(id, userId, updateData.status, updateData.notes);
  }
}
