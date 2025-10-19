import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { ResumeFeedback, ResumeFeedbackDocument, FeedbackType, FeedbackSeverity } from './schemas/resume.schema';
import { AiClientService } from '../ai-integration/ai-client.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(ResumeFeedback.name) private resumeFeedbackModel: Model<ResumeFeedbackDocument>,
    private aiClientService: AiClientService
  ) {}

  async findAllByUser(userId: string) {
    return this.resumeModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async findOne(id: string, userId: string) {
    const resume = await this.resumeModel
      .findOne({ _id: id, userId })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const feedback = await this.resumeFeedbackModel
      .find({ resumeId: id })
      .sort({ createdAt: -1 })
      .lean();

    return { ...resume, feedback };
  }

  async create(
    userId: string,
    file: Express.Multer.File,
    title?: string
  ) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    const resume = await this.resumeModel.create({
      userId,
      title: title || file.originalname,
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      content: null,
      skills: [],
      experience: null,
      education: null,
      isActive: true,
      version: 1
    });

    // Trigger AI parsing asynchronously
    this.triggerAiParsing(resume._id.toString(), filePath);

    return resume.toObject();
  }

  async update(id: string, userId: string, updateData: any) {
    const resume = await this.resumeModel
      .findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      )
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async remove(id: string, userId: string) {
    const resume = await this.resumeModel
      .findOne({ _id: id, userId })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Delete file
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await this.resumeModel.findByIdAndDelete(id);
    await this.resumeFeedbackModel.deleteMany({ resumeId: id });

    return { message: 'Resume deleted successfully' };
  }

  async analyze(id: string, userId: string) {
    const resume = await this.resumeModel
      .findOne({ _id: id, userId })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    try {
      const fileBuffer = fs.readFileSync(resume.filePath);
      const analysis = await this.aiClientService.analyzeResumeFile(fileBuffer, resume.fileName);
      
      // Save analysis results and mark as analyzed
      await this.resumeModel.findByIdAndUpdate(id, {
        analysisResults: analysis,
        isAnalyzed: true,
        lastAnalyzedAt: new Date(),
        // Update parsed content from analysis
        content: analysis,
        skills: analysis.skills || [],
        experience: analysis.experience_years || 0,
      });
      
      // Store AI feedback
      await this.storeFeedback(id, analysis);

      return analysis;
    } catch (error) {
      throw new BadRequestException('Failed to analyze resume');
    }
  }

  async getFeedback(resumeId: string, userId: string) {
    const resume = await this.resumeModel
      .findOne({ _id: resumeId, userId })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return this.resumeFeedbackModel
      .find({ resumeId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAnalysis(id: string, userId: string) {
    const resume = await this.resumeModel
      .findOne({ _id: id, userId })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!resume.isAnalyzed || !resume.analysisResults) {
      throw new NotFoundException('Resume has not been analyzed yet');
    }

    return {
      resume: {
        title: resume.title,
        fileName: resume.fileName,
        lastAnalyzedAt: resume.lastAnalyzedAt
      },
      analysis: resume.analysisResults
    };
  }

  private async triggerAiParsing(resumeId: string, filePath: string) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const analysis = await this.aiClientService.analyzeResumeFile(fileBuffer, path.basename(filePath));
      
      // Update resume with parsed data
      await this.resumeModel.findByIdAndUpdate(resumeId, {
        content: analysis.parsed_data,
        skills: analysis.parsed_data?.skills || [],
        experience: analysis.parsed_data?.experience,
        education: analysis.parsed_data?.education
      });

      // Store feedback
      await this.storeFeedback(resumeId, analysis);
    } catch (error) {
      console.error('AI parsing failed:', error);
    }
  }

  private async storeFeedback(resumeId: string, analysis: any) {
    if (analysis.feedback && Array.isArray(analysis.feedback)) {
      const feedbackPromises = analysis.feedback.map((feedback: any) =>
        this.resumeFeedbackModel.create({
          resumeId,
          type: this.mapFeedbackType(feedback.type),
          category: feedback.category || 'general',
          severity: this.mapFeedbackSeverity(feedback.severity),
          title: feedback.title,
          description: feedback.description,
          suggestion: feedback.suggestion,
          section: feedback.section,
          lineNumber: feedback.line_number,
          isAiGenerated: true,
          isResolved: false
        })
      );

      await Promise.all(feedbackPromises);
    }
  }

  private mapFeedbackType(type: string): FeedbackType {
    const typeMap: Record<string, FeedbackType> = {
      'suggestion': FeedbackType.SUGGESTION,
      'error': FeedbackType.ERROR,
      'warning': FeedbackType.WARNING,
      'info': FeedbackType.INFO
    };
    return typeMap[type?.toLowerCase()] || FeedbackType.INFO;
  }

  private mapFeedbackSeverity(severity: string): FeedbackSeverity {
    const severityMap: Record<string, FeedbackSeverity> = {
      'low': FeedbackSeverity.LOW,
      'medium': FeedbackSeverity.MEDIUM,
      'high': FeedbackSeverity.HIGH,
      'critical': FeedbackSeverity.CRITICAL
    };
    return severityMap[severity?.toLowerCase()] || FeedbackSeverity.LOW;
  }
}
