import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  findAll(@Query() filters: any) {
    return this.jobsService.findAll(filters);
  }

  @Get('search')
  search(@Query('q') query: string, @Query() filters: any) {
    return this.jobsService.search(query, filters);
  }

  @Get('recommendations')
  getRecommendations(@CurrentUser('id') userId: string) {
    return this.jobsService.getRecommendations(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
