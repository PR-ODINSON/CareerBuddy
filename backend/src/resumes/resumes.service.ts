import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class ResumesService {
  private readonly uploadsPath: string;
  private readonly aiResumeAnalyzerUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.uploadsPath = path.join(process.cwd(), 'uploads', 'resumes');
    this.aiResumeAnalyzerUrl = this.configService.get<string>('AI_RESUME_ANALYZER_URL', 'http://localhost:8001');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  async findAllByUser(userId: string) {
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      include: {
        feedback: {
          where: { isAiGenerated: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 3
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return resumes.map(resume => ({
      ...resume,
      analysisResults: this.parseAnalysisResults(resume.content),
      overallScore: this.calculateOverallScore(resume)
    }));
  }

  async findOne(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
      include: {
        feedback: {
          orderBy: { createdAt: 'desc' }
        },
        versions: {
          orderBy: { version: 'desc' }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return {
      ...resume,
      analysisResults: this.parseAnalysisResults(resume.content),
      overallScore: this.calculateOverallScore(resume)
    };
  }

  async uploadResume(userId: string, file: Express.Multer.File) {
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadsPath, fileName);

    try {
      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create resume record
      const resume = await this.prisma.resume.create({
        data: {
          userId,
          title: this.extractTitle(file.originalname),
          fileName: file.originalname,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          version: await this.getNextVersion(userId)
        }
      });

      // Trigger AI analysis asynchronously
      this.analyzeResumeAsync(resume.id, filePath, file.mimetype);

      return {
        id: resume.id,
        title: resume.title,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.createdAt,
        message: 'Resume uploaded successfully. Analysis in progress...'
      };

    } catch (error) {
      // Clean up file if database operation fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new BadRequestException('Failed to upload resume');
    }
  }

  async analyzeResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    try {
      const analysisResult = await this.callAIAnalysisService(resume.filePath, resume.mimeType);
      
      // Update resume with analysis results
      const updatedResume = await this.prisma.resume.update({
        where: { id },
        data: {
          content: analysisResult.parsed_data,
          skills: analysisResult.parsed_data.skills || [],
          experience: analysisResult.parsed_data.experience,
          education: analysisResult.parsed_data.education
        },
        include: {
          feedback: true
        }
      });

      // Store AI feedback
      if (analysisResult.feedback && analysisResult.feedback.length > 0) {
        await this.storeAIFeedback(id, analysisResult.feedback);
      }

      return {
        resume: updatedResume,
        analysisResults: analysisResult,
        overallScore: analysisResult.overall_score || this.calculateOverallScore(updatedResume)
      };

    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw new BadRequestException('Resume analysis failed. Please try again.');
    }
  }

  async setActiveResume(userId: string, resumeId: string) {
    // Verify resume belongs to user
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Deactivate all other resumes for the user
    await this.prisma.resume.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    // Set the specified resume as active
    const activeResume = await this.prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: true }
    });

    return {
      message: 'Resume set as active',
      resume: activeResume
    };
  }

  async deleteResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Delete file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Delete from database (cascade will handle related records)
    await this.prisma.resume.delete({
      where: { id }
    });

    return { message: 'Resume deleted successfully' };
  }

  async createVersion(userId: string, resumeId: string, content: any, changes?: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const nextVersion = await this.getNextVersionForResume(resumeId);

    const version = await this.prisma.resumeVersion.create({
      data: {
        resumeId,
        version: nextVersion,
        title: `${resume.title} v${nextVersion}`,
        content,
        changes
      }
    });

    return version;
  }

  async getResumeVersions(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const versions = await this.prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { version: 'desc' }
    });

    return versions;
  }

  async getFeedback(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const feedback = await this.prisma.resumeFeedback.findMany({
      where: { resumeId },
      orderBy: { createdAt: 'desc' }
    });

    return feedback;
  }

  async optimizeForJob(userId: string, resumeId: string, jobDescription: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    try {
      // Call AI service for keyword optimization
      const response = await axios.post(`${this.aiResumeAnalyzerUrl}/optimize/keywords`, {
        resume_content: resume.content,
        job_description: jobDescription
      });

      const optimization = response.data;

      return {
        originalResume: resume,
        optimization,
        suggestedChanges: optimization.suggested_changes || [],
        keywordMatches: optimization.keyword_matches || [],
        atsScore: optimization.ats_score || 0
      };

    } catch (error) {
      console.error('Job optimization failed:', error);
      throw new BadRequestException('Resume optimization failed. Please try again.');
    }
  }

  async getResumeStats(userId: string) {
    const [
      totalResumes,
      activeResume,
      averageScore,
      totalFeedback,
      recentUploads
    ] = await Promise.all([
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.resume.findFirst({
        where: { userId, isActive: true },
        select: { id: true, title: true, updatedAt: true }
      }),
      this.calculateUserAverageScore(userId),
      this.prisma.resumeFeedback.count({
        where: {
          resume: { userId }
        }
      }),
      this.prisma.resume.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      totalResumes,
      activeResume,
      averageScore,
      totalFeedback,
      recentUploads
    };
  }

  // ====== PRIVATE HELPER METHODS ======

  private async analyzeResumeAsync(resumeId: string, filePath: string, mimeType: string) {
    try {
      const analysisResult = await this.callAIAnalysisService(filePath, mimeType);
      
      // Update resume with analysis results
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          content: analysisResult.parsed_data,
          skills: analysisResult.parsed_data.skills || [],
          experience: analysisResult.parsed_data.experience,
          education: analysisResult.parsed_data.education
        }
      });

      // Store AI feedback
      if (analysisResult.feedback && analysisResult.feedback.length > 0) {
        await this.storeAIFeedback(resumeId, analysisResult.feedback);
      }

    } catch (error) {
      console.error('Async AI analysis failed for resume:', resumeId, error);
    }
  }

  private async callAIAnalysisService(filePath: string, mimeType: string) {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, path.basename(filePath));

    const response = await axios.post(`${this.aiResumeAnalyzerUrl}/analyze/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000 // 30 seconds timeout
    });

    return response.data;
  }

  private async storeAIFeedback(resumeId: string, feedbackItems: any[]) {
    const feedbackData = feedbackItems.map(item => ({
      resumeId,
      type: this.mapFeedbackType(item.type),
      category: item.category || 'general',
      title: item.title,
      description: item.description,
      severity: this.mapFeedbackSeverity(item.severity),
      suggestion: item.suggestion,
      lineNumber: item.line_number,
      section: item.section,
      isAiGenerated: true
    }));

    await this.prisma.resumeFeedback.createMany({
      data: feedbackData
    });
  }

  private mapFeedbackType(type: string) {
    const typeMap: Record<string, string> = {
      'suggestion': 'SUGGESTION',
      'error': 'ERROR',
      'warning': 'WARNING',
      'info': 'INFO'
    };
    return typeMap[type.toLowerCase()] || 'INFO';
  }

  private mapFeedbackSeverity(severity: string) {
    const severityMap: Record<string, string> = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'critical': 'CRITICAL'
    };
    return severityMap[severity.toLowerCase()] || 'MEDIUM';
  }

  private extractTitle(filename: string): string {
    const nameWithoutExt = path.parse(filename).name;
    return nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private async getNextVersion(userId: string): Promise<number> {
    const lastResume = await this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' }
    });

    return (lastResume?.version || 0) + 1;
  }

  private async getNextVersionForResume(resumeId: string): Promise<number> {
    const lastVersion = await this.prisma.resumeVersion.findFirst({
      where: { resumeId },
      orderBy: { version: 'desc' }
    });

    return (lastVersion?.version || 0) + 1;
  }

  private parseAnalysisResults(content: any) {
    if (!content || typeof content !== 'object') {
      return null;
    }

    return {
      ats_score: content.ats_score || 0,
      skills: content.skills || [],
      experience: content.experience || [],
      education: content.education || [],
      contact_info: content.contact_info || {},
      summary: content.summary || '',
      achievements: content.achievements || [],
      keywords: content.keywords || []
    };
  }

  private calculateOverallScore(resume: any): number {
    if (resume.content && resume.content.ats_score) {
      return Math.round(resume.content.ats_score);
    }

    // Fallback scoring algorithm
    let score = 50; // Base score

    if (resume.skills && resume.skills.length > 5) score += 20;
    if (resume.experience) score += 20;
    if (resume.education) score += 10;

    return Math.min(100, score);
  }

  private async calculateUserAverageScore(userId: string): Promise<number> {
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      select: { content: true }
    });

    if (resumes.length === 0) return 0;

    const totalScore = resumes.reduce((sum, resume) => {
      return sum + this.calculateOverallScore(resume);
    }, 0);

    return Math.round(totalScore / resumes.length);
  }
}