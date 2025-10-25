import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Application, ApplicationDocument, ApplicationStatus } from './schemas/application.schema';
import { Interview, InterviewDocument } from './schemas/application.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>
  ) {}

  async findAllByUser(userId: string, status?: ApplicationStatus) {
    const filter: any = { userId };
    
    if (status) {
      filter.status = status;
    }

    return this.applicationModel
      .find(filter)
      .populate('jobId', 'title company location salaryMin salaryMax experienceLevel employmentType')
      .populate('resumeId', 'title fileName')
      .sort({ appliedAt: -1 })
      .lean();
  }

  async findOne(id: string, userId: string) {
    const application = await this.applicationModel
      .findOne({ _id: id, userId })
      .populate('jobId')
      .populate('resumeId')
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get interviews for this application
    const interviews = await this.interviewModel
      .find({ applicationId: id })
      .sort({ scheduledAt: 1 })
      .lean();

    return { ...application, interviews };
  }

  async findAllByJob(jobId: string) {
    const applications = await this.applicationModel
      .find({ jobId })
      .populate('userId', 'firstName lastName email university major graduationYear gpa phone')
      .populate('resumeId', 'title fileName')
      .sort({ appliedAt: -1 })
      .lean();

    // Transform the data to match frontend expectations
    return applications.map(app => ({
      ...app,
      applicant: app.userId, // Map userId to applicant for frontend compatibility
    }));
  }

  async create(userId: string, createApplicationDto: CreateApplicationDto) {
    // Check if user already applied for this job
    const existingApplication = await this.applicationModel
      .findOne({ userId, jobId: createApplicationDto.jobId })
      .lean();

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this job');
    }

    const application = await this.applicationModel.create({
      ...createApplicationDto,
      userId,
      appliedAt: new Date()
    });

    return this.applicationModel
      .findById(application._id)
      .populate('jobId', 'title company')
      .populate('resumeId', 'title fileName')
      .lean();
  }

  async update(id: string, userId: string, updateApplicationDto: UpdateApplicationDto) {
    const application = await this.applicationModel
      .findOne({ _id: id, userId })
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only allow updates if application is not yet submitted or is in certain statuses
    if (application.status === ApplicationStatus.REJECTED || 
        application.status === ApplicationStatus.OFFER) {
      throw new BadRequestException('Cannot update application in current status');
    }

    return this.applicationModel
      .findByIdAndUpdate(id, updateApplicationDto, { new: true })
      .populate('jobId', 'title company')
      .populate('resumeId', 'title fileName')
      .lean();
  }

  async updateStatus(id: string, status: ApplicationStatus, userRole: UserRole, userId?: string) {
    const filter: any = { _id: id };
    
    // Students can only update their own applications
    if (userRole === UserRole.STUDENT && userId) {
      filter.userId = userId;
    }

    const application = await this.applicationModel
      .findOne(filter)
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Students can only withdraw their applications
    if (userRole === UserRole.STUDENT && status !== ApplicationStatus.WITHDRAWN) {
      throw new ForbiddenException('Students can only withdraw applications');
    }

    return this.applicationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('jobId', 'title company')
      .populate('userId', 'firstName lastName email')
      .lean();
  }

  async withdraw(id: string, userId: string) {
    return this.updateStatus(id, ApplicationStatus.WITHDRAWN, UserRole.STUDENT, userId);
  }

  async remove(id: string, userId: string) {
    const application = await this.applicationModel
      .findOne({ _id: id, userId })
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only allow deletion if application is in draft or withdrawn status
    if (application.status !== ApplicationStatus.WITHDRAWN && 
        application.status !== ApplicationStatus.APPLIED) {
      throw new BadRequestException('Cannot delete application in current status');
    }

    await this.applicationModel.findByIdAndDelete(id);
    return { message: 'Application deleted successfully' };
  }

  async getApplicationStats(userId: string) {
    const applications = await this.applicationModel
      .find({ userId })
      .lean();

    const stats = applications.reduce((acc, app) => {
      acc.total++;
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, { 
      total: 0,
      [ApplicationStatus.APPLIED]: 0,
      [ApplicationStatus.REVIEWING]: 0,
      [ApplicationStatus.PHONE_SCREEN]: 0,
      [ApplicationStatus.INTERVIEW]: 0,
      [ApplicationStatus.OFFER]: 0,
      [ApplicationStatus.REJECTED]: 0,
      [ApplicationStatus.WITHDRAWN]: 0
    });

    return stats;
  }

  // Interview management
  async createInterview(createInterviewDto: CreateInterviewDto) {
    const interview = await this.interviewModel.create(createInterviewDto);
    
    return this.interviewModel
      .findById(interview._id)
      .populate('applicationId')
      .lean();
  }

  async updateInterview(id: string, updateInterviewDto: UpdateInterviewDto) {
    const interview = await this.interviewModel
      .findByIdAndUpdate(id, updateInterviewDto, { new: true })
      .populate('applicationId')
      .lean();

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async getInterviews(userId: string) {
    const applications = await this.applicationModel
      .find({ userId })
      .select('_id')
      .lean();

    const applicationIds = applications.map(app => app._id);

    return this.interviewModel
      .find({ applicationId: { $in: applicationIds } })
      .populate('applicationId', 'jobId status')
      .sort({ scheduledAt: 1 })
      .lean();
  }

  async getTimeline(id: string, userId: string) {
    const application = await this.applicationModel
      .findOne({ _id: id, userId })
      .lean();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interviews = await this.interviewModel
      .find({ applicationId: id })
      .sort({ scheduledAt: 1 })
      .lean();

    const timeline = [
      {
        event: 'Applied',
        date: application.appliedAt,
        status: 'completed',
        description: 'Application submitted'
      }
    ];

    interviews.forEach(interview => {
      timeline.push({
        event: 'Interview',
        date: interview.scheduledAt,
        status: interview.status.toLowerCase(),
        description: `${interview.type} interview`
      });
    });

    // Add status changes based on current status
    if (application.status === ApplicationStatus.OFFER) {
      timeline.push({
        event: 'Offer',
        date: new Date(),
        status: 'completed',
        description: 'Job offer received'
      });
    } else if (application.status === ApplicationStatus.REJECTED) {
      timeline.push({
        event: 'Rejected',
        date: new Date(),
        status: 'rejected',
        description: 'Application rejected'
      });
    }

    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
