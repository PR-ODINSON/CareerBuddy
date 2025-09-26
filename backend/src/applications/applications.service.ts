import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus, UserRole } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string, status?: ApplicationStatus) {
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }

    return this.prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            experienceLevel: true,
            employmentType: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async findOne(id: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        job: {
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        resume: true,
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: true
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async create(createApplicationDto: CreateApplicationDto, userId: string) {
    const { jobId, resumeId, coverLetter, notes } = createApplicationDto;

    // Verify job exists and is active
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job || !job.isActive) {
      throw new NotFoundException('Job not found or inactive');
    }

    // Verify resume belongs to user
    if (resumeId) {
      const resume = await this.prisma.resume.findFirst({
        where: { id: resumeId, userId }
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }
    }

    // Check if user already applied to this job
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId,
        resumeId,
        coverLetter,
        notes,
        status: ApplicationStatus.APPLIED
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        }
      }
    });

    // Log the application for analytics
    await this.logApplicationEvent(userId, 'application_submitted', {
      jobId,
      jobTitle: job.title,
      company: job.company
    });

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Students can only update certain fields
    const allowedFields = ['notes', 'coverLetter'];
    const updateData: any = {};

    Object.keys(updateApplicationDto).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = updateApplicationDto[key];
      }
    });

    return this.prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        }
      }
    });
  }

  async updateStatus(id: string, status: ApplicationStatus, userId: string, userRole: UserRole) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            creator: true
          }
        },
        user: true
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check permissions
    const canUpdate = 
      userRole === UserRole.ADMIN ||
      (userRole === UserRole.COUNSELOR) ||
      application.job.createdBy === userId ||
      (application.userId === userId && this.isStudentAllowedStatus(status));

    if (!canUpdate) {
      throw new ForbiddenException('Not authorized to update this application status');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
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

    // Log status change for analytics
    await this.logApplicationEvent(application.userId, 'application_status_changed', {
      applicationId: id,
      oldStatus: application.status,
      newStatus: status,
      jobTitle: application.job.title,
      updatedBy: userId
    });

    return updatedApplication;
  }

  async withdraw(id: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new BadRequestException('Application is already withdrawn');
    }

    return this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.WITHDRAWN },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.application.delete({
      where: { id }
    });

    return { message: 'Application deleted successfully' };
  }

  async getApplicationStats(userId: string) {
    const [
      totalApplications,
      statusBreakdown,
      recentApplications,
      successRate
    ] = await Promise.all([
      this.prisma.application.count({
        where: { userId }
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true
      }),
      this.prisma.application.count({
        where: {
          userId,
          appliedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      this.calculateSuccessRate(userId)
    ]);

    return {
      totalApplications,
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count
      })),
      recentApplications,
      successRate
    };
  }

  async getApplicationsByJob(jobId: string, userId: string, userRole: UserRole) {
    // Check if user can view applications for this job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const canView = 
      userRole === UserRole.ADMIN ||
      userRole === UserRole.COUNSELOR ||
      job.createdBy === userId;

    if (!canView) {
      throw new ForbiddenException('Not authorized to view applications for this job');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: true
          }
        },
        resume: {
          select: {
            id: true,
            title: true,
            skills: true
          }
        },
        interviews: {
          select: {
            id: true,
            type: true,
            status: true,
            scheduledAt: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async scheduleInterview(
    applicationId: string,
    interviewData: {
      type: string;
      scheduledAt: string;
      duration?: number;
      location?: string;
      interviewerName?: string;
      interviewerEmail?: string;
      notes?: string;
    },
    userId: string,
    userRole: UserRole
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: true
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check permissions
    const canSchedule = 
      userRole === UserRole.ADMIN ||
      userRole === UserRole.COUNSELOR ||
      application.job.createdBy === userId;

    if (!canSchedule) {
      throw new ForbiddenException('Not authorized to schedule interviews');
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        type: interviewData.type as any,
        scheduledAt: new Date(interviewData.scheduledAt),
        duration: interviewData.duration,
        location: interviewData.location,
        interviewerName: interviewData.interviewerName,
        interviewerEmail: interviewData.interviewerEmail,
        notes: interviewData.notes
      }
    });

    // Update application status if not already in interview stage
    if (application.status === ApplicationStatus.APPLIED || application.status === ApplicationStatus.REVIEWING) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.INTERVIEW }
      });
    }

    return interview;
  }

  async getApplicationTimeline(applicationId: string, userId: string, userRole: UserRole) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: true,
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        }
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check permissions
    const canView = 
      userRole === UserRole.ADMIN ||
      userRole === UserRole.COUNSELOR ||
      application.job.createdBy === userId ||
      application.userId === userId;

    if (!canView) {
      throw new ForbiddenException('Not authorized to view this application');
    }

    // Build timeline events
    const timeline = [
      {
        type: 'application_submitted',
        date: application.appliedAt,
        description: 'Application submitted',
        status: 'completed'
      }
    ];

    // Add status changes (this would require an audit log table)
    // For now, we'll just add current status
    if (application.status !== ApplicationStatus.APPLIED) {
      timeline.push({
        type: 'status_changed',
        date: application.updatedAt,
        description: `Status changed to ${application.status}`,
        status: 'completed'
      });
    }

    // Add interview events
    application.interviews.forEach(interview => {
      timeline.push({
        type: 'interview_scheduled',
        date: interview.scheduledAt,
        description: `${interview.type} interview scheduled`,
        status: interview.status === 'COMPLETED' ? 'completed' : 'pending'
      });
    });

    return {
      application,
      timeline: timeline.sort((a, b) => a.date.getTime() - b.date.getTime())
    };
  }

  // ====== PRIVATE HELPER METHODS ======

  private isStudentAllowedStatus(status: ApplicationStatus): boolean {
    // Students can only withdraw their applications
    return status === ApplicationStatus.WITHDRAWN;
  }

  private async calculateSuccessRate(userId: string): Promise<number> {
    const [total, successful] = await Promise.all([
      this.prisma.application.count({
        where: { userId }
      }),
      this.prisma.application.count({
        where: {
          userId,
          status: { in: [ApplicationStatus.OFFER, ApplicationStatus.INTERVIEW] }
        }
      })
    ]);

    return total > 0 ? Math.round((successful / total) * 100) : 0;
  }

  private async logApplicationEvent(userId: string, action: string, metadata: any) {
    await this.prisma.userAnalytics.create({
      data: {
        userId,
        action,
        metadata,
        ipAddress: '', // Would be filled from request
        userAgent: '' // Would be filled from request
      }
    });
  }
}