import { Controller, Get, Post, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.resumesService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.findOne(id, userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadResume(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.resumesService.uploadResume(userId, file);
  }

  @Post(':id/analyze')
  analyzeResume(@Param('id') id: string) {
    return this.resumesService.analyzeResume(id);
  }
}
