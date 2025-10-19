import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Param, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

import { ResumesService } from './resumes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user resumes' })
  @ApiResponse({ status: 200, description: 'List of user resumes' })
  findAll(@CurrentUser('id') userId: string) {
    return this.resumesService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific resume' })
  @ApiResponse({ status: 200, description: 'Resume details' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.findOne(id, userId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new resume' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Resume uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @UseInterceptors(FileInterceptor('file'))
  uploadResume(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ 
            fileType: /(pdf|docx|txt)$/ 
          }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.resumesService.create(userId, file);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze resume with AI' })
  @ApiResponse({ status: 200, description: 'Resume analysis completed' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  analyzeResume(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.analyze(id, userId);
  }

  @Put(':id/set-active')
  @ApiOperation({ summary: 'Set resume as primary/active' })
  @ApiResponse({ status: 200, description: 'Resume set as active' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  setActiveResume(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.update(id, userId, { isActive: true });
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Get resume analysis results' })
  @ApiResponse({ status: 200, description: 'Analysis results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found or not analyzed' })
  getAnalysis(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.getAnalysis(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resume' })
  @ApiResponse({ status: 200, description: 'Resume deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  deleteResume(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumesService.remove(id, userId);
  }
}
