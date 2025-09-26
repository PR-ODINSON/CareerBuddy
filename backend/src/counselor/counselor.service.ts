import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AssignStudentDto } from './dto/assign-student.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { 
  UserRole, 
  FeedbackType, 
  FeedbackSeverity, 
  SessionStatus, 
  ApplicationStatus 
} from '@prisma/client';

@Injectable()
export class CounselorService {
  constructor(private prisma: PrismaService) {}

  // ====== STUDENT MANAGEMENT ======

  async getAssignedStudents(counselorId: string, page: number = 1, limit: number = 20) {
    // First verify the user is a counselor
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;

    const assignments = await this.prisma.counselorAssignment.findMany({
      where: { counselorId },
      include: {
        student: {
          include: {
            studentProfile: true,
            resumes: {
              where: { isActive: true },
              take: 1,
              orderBy: { updatedAt: 'desc' }
            },
            applications: {
              take: 5,
              orderBy: { appliedAt: 'desc' }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prisma.counselorAssignment.count({
      where: { counselorId }
    });

    return {
      students: assignments.map(assignment => ({
        assignment: {
          id: assignment.id,
          assignedAt: assignment.createdAt,
          notes: assignment.notes,
          expiresAt: assignment.expiresAt
        },
        student: assignment.student
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getStudentDetails(counselorId: string, studentId: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true,
        resumes: {
          orderBy: { updatedAt: 'desc' },
          include: {
            feedback: {
              where: { counselorId },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        applications: {
          orderBy: { appliedAt: 'desc' },
          include: {
            job: true,
            interviews: true
          }
        },
        sessions: {
          where: { counselorId },
          orderBy: { scheduledAt: 'desc' }
        }
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Calculate student metrics
    const metrics = await this.calculateStudentMetrics(studentId);

    return {
      student,
      metrics
    };
  }

  async getStudentResumes(counselorId: string, studentId: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const resumes = await this.prisma.resume.findMany({
      where: { userId: studentId },
      include: {
        feedback: {
          where: { counselorId },
          orderBy: { createdAt: 'desc' }
        },
        versions: {
          orderBy: { version: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return resumes;
  }

  async getStudentApplications(counselorId: string, studentId: string, status?: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const where: any = { userId: studentId };
    if (status) {
      where.status = status as ApplicationStatus;
    }

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        job: true,
        resume: true,
        interviews: {
          orderBy: { scheduledAt: 'asc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return applications;
  }

  async getStudentProgress(counselorId: string, studentId: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const metrics = await this.calculateStudentMetrics(studentId);
    const progressTrends = await this.calculateProgressTrends(studentId);

    return {
      metrics,
      trends: progressTrends
    };
  }

  // ====== FEEDBACK MANAGEMENT ======

  async createFeedback(counselorId: string, createFeedbackDto: CreateFeedbackDto) {
    const { resumeId, studentId, ...feedbackData } = createFeedbackDto;

    // Verify resume exists and get student ID if not provided
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      include: { user: true }
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const actualStudentId = studentId || resume.userId;
    await this.verifyStudentAssignment(counselorId, actualStudentId);

    const feedback = await this.prisma.resumeFeedback.create({
      data: {
        ...feedbackData,
        resumeId,
        counselorId,
        isAiGenerated: false
      },
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return feedback;
  }

  async getAllFeedback(
    counselorId: string,
    filters: { studentId?: string; resumeId?: string },
    page: number = 1,
    limit: number = 20
  ) {
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;
    const where: any = { counselorId };

    if (filters.resumeId) {
      where.resumeId = filters.resumeId;
    }

    if (filters.studentId) {
      where.resume = {
        userId: filters.studentId
      };
    }

    const feedback = await this.prisma.resumeFeedback.findMany({
      where,
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prisma.resumeFeedback.count({ where });

    return {
      feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getFeedback(counselorId: string, feedbackId: string) {
    const feedback = await this.prisma.resumeFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!feedback || feedback.counselorId !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async updateFeedback(counselorId: string, feedbackId: string, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.prisma.resumeFeedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback || feedback.counselorId !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    return this.prisma.resumeFeedback.update({
      where: { id: feedbackId },
      data: updateFeedbackDto,
      include: {
        resume: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async deleteFeedback(counselorId: string, feedbackId: string) {
    const feedback = await this.prisma.resumeFeedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback || feedback.counselorId !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    await this.prisma.resumeFeedback.delete({
      where: { id: feedbackId }
    });

    return { message: 'Feedback deleted successfully' };
  }

  // ====== COUNSELING SESSIONS ======

  async createSession(counselorId: string, createSessionDto: CreateSessionDto) {
    await this.verifyStudentAssignment(counselorId, createSessionDto.studentId);

    const session = await this.prisma.counselingSession.create({
      data: {
        ...createSessionDto,
        counselorId,
        scheduledAt: new Date(createSessionDto.scheduledAt)
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return session;
  }

  async getAllSessions(
    counselorId: string,
    filters: { status?: string; studentId?: string },
    page: number = 1,
    limit: number = 20
  ) {
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;
    const where: any = { counselorId };

    if (filters.status) {
      where.status = filters.status as SessionStatus;
    }

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    const sessions = await this.prisma.counselingSession.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { scheduledAt: 'desc' }
    });

    const total = await this.prisma.counselingSession.count({ where });

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSession(counselorId: string, sessionId: string) {
    const session = await this.prisma.counselingSession.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: true
          }
        },
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!session || session.counselorId !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async updateSession(counselorId: string, sessionId: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.prisma.counselingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.counselorId !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.counselingSession.update({
      where: { id: sessionId },
      data: {
        ...updateSessionDto,
        scheduledAt: updateSessionDto.scheduledAt ? new Date(updateSessionDto.scheduledAt) : undefined
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async completeSession(
    counselorId: string,
    sessionId: string,
    feedback: { notes?: string; feedback?: string; rating?: number }
  ) {
    const session = await this.prisma.counselingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.counselorId !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.counselingSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        ...feedback
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async cancelSession(counselorId: string, sessionId: string) {
    const session = await this.prisma.counselingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.counselorId !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.counselingSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.CANCELLED }
    });

    return { message: 'Session cancelled successfully' };
  }

  // ====== ANALYTICS & REPORTING ======

  async getDashboardOverview(counselorId: string) {
    await this.verifyCounselor(counselorId);

    const [
      totalStudents,
      totalSessions,
      upcomingSessions,
      pendingFeedback,
      completedSessions,
      averageRating
    ] = await Promise.all([
      this.prisma.counselorAssignment.count({ where: { counselorId } }),
      this.prisma.counselingSession.count({ where: { counselorId } }),
      this.prisma.counselingSession.count({
        where: {
          counselorId,
          status: SessionStatus.SCHEDULED,
          scheduledAt: { gte: new Date() }
        }
      }),
      this.prisma.resumeFeedback.count({
        where: { counselorId, isResolved: false }
      }),
      this.prisma.counselingSession.count({
        where: { counselorId, status: SessionStatus.COMPLETED }
      }),
      this.prisma.counselingSession.aggregate({
        where: { counselorId, rating: { not: null } },
        _avg: { rating: true }
      })
    ]);

    // Recent activity
    const recentSessions = await this.prisma.counselingSession.findMany({
      where: { counselorId },
      include: {
        student: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const recentFeedback = await this.prisma.resumeFeedback.findMany({
      where: { counselorId },
      include: {
        resume: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      stats: {
        totalStudents,
        totalSessions,
        upcomingSessions,
        pendingFeedback,
        completedSessions,
        averageRating: averageRating._avg.rating || 0
      },
      recentActivity: {
        sessions: recentSessions,
        feedback: recentFeedback
      }
    };
  }

  async getStudentsPerformance(counselorId: string, timeframe: string = 'month') {
    await this.verifyCounselor(counselorId);

    const timeFilter = this.getTimeFilter(timeframe);

    // Get assigned students
    const assignments = await this.prisma.counselorAssignment.findMany({
      where: { counselorId },
      include: { student: true }
    });

    const studentIds = assignments.map(a => a.studentId);

    // Calculate performance metrics for each student
    const studentsPerformance = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = assignments.find(a => a.studentId === studentId)?.student;
        const metrics = await this.calculateStudentMetrics(studentId, timeFilter);
        return {
          student: {
            id: student?.id,
            name: `${student?.firstName} ${student?.lastName}`,
            email: student?.email
          },
          metrics
        };
      })
    );

    return studentsPerformance;
  }

  async getResumeTrends(counselorId: string, timeframe: string = 'month') {
    await this.verifyCounselor(counselorId);

    const timeFilter = this.getTimeFilter(timeframe);
    const studentIds = await this.getAssignedStudentIds(counselorId);

    // Resume quality trends
    const resumes = await this.prisma.resume.findMany({
      where: {
        userId: { in: studentIds },
        createdAt: timeFilter
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by time periods and calculate average scores
    const trends = this.groupByTimePeriod(resumes, timeframe, (resume) => {
      // Calculate resume score based on content analysis
      return this.calculateResumeScore(resume);
    });

    return trends;
  }

  async getApplicationSuccess(counselorId: string, timeframe: string = 'month') {
    await this.verifyCounselor(counselorId);

    const timeFilter = this.getTimeFilter(timeframe);
    const studentIds = await this.getAssignedStudentIds(counselorId);

    const applications = await this.prisma.application.findMany({
      where: {
        userId: { in: studentIds },
        appliedAt: timeFilter
      },
      include: {
        job: true,
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    // Calculate success rates
    const total = applications.length;
    const successful = applications.filter(app =>
      [ApplicationStatus.OFFER, ApplicationStatus.INTERVIEW].includes(app.status)
    ).length;

    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Group by status
    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      successRate,
      total,
      successful,
      statusBreakdown,
      applications: applications.slice(0, 20) // Recent applications
    };
  }

  async getSkillsGapAnalysis(counselorId: string) {
    await this.verifyCounselor(counselorId);

    const studentIds = await this.getAssignedStudentIds(counselorId);

    // Get all resumes for assigned students
    const resumes = await this.prisma.resume.findMany({
      where: { userId: { in: studentIds } },
      select: { skills: true, userId: true }
    });

    // Get all job applications to see what skills are in demand
    const applications = await this.prisma.application.findMany({
      where: { userId: { in: studentIds } },
      include: {
        job: {
          select: { skills: true, requirements: true }
        }
      }
    });

    // Analyze skills gaps
    const skillsAnalysis = this.analyzeSkillsGaps(resumes, applications);

    return skillsAnalysis;
  }

  // ====== ADMIN FUNCTIONS ======

  async assignStudent(assignStudentDto: AssignStudentDto) {
    const { counselorId, studentId, notes, expiresAt } = assignStudentDto;

    // Verify counselor and student exist
    const [counselor, student] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: counselorId, role: UserRole.COUNSELOR }
      }),
      this.prisma.user.findUnique({
        where: { id: studentId, role: UserRole.STUDENT }
      })
    ]);

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.counselorAssignment.findUnique({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });

    if (existingAssignment) {
      throw new BadRequestException('Student is already assigned to this counselor');
    }

    const assignment = await this.prisma.counselorAssignment.create({
      data: {
        counselorId,
        studentId,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      },
      include: {
        counselor: {
          select: { firstName: true, lastName: true, email: true }
        },
        student: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    return assignment;
  }

  async removeStudentAssignment(counselorId: string, studentId: string) {
    const assignment = await this.prisma.counselorAssignment.findUnique({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.counselorAssignment.delete({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });

    return { message: 'Student assignment removed successfully' };
  }

  async getAllAssignments(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const assignments = await this.prisma.counselorAssignment.findMany({
      include: {
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            counselorProfile: true
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prisma.counselorAssignment.count();

    return {
      assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ====== HELPER METHODS ======

  private async verifyCounselor(counselorId: string) {
    const counselor = await this.prisma.user.findUnique({
      where: { id: counselorId }
    });

    if (!counselor || ![UserRole.COUNSELOR, UserRole.ADMIN].includes(counselor.role)) {
      throw new ForbiddenException('Access denied: Counselor role required');
    }

    return counselor;
  }

  private async verifyStudentAssignment(counselorId: string, studentId: string) {
    const assignment = await this.prisma.counselorAssignment.findUnique({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });

    if (!assignment) {
      throw new ForbiddenException('Student is not assigned to this counselor');
    }

    return assignment;
  }

  private async getAssignedStudentIds(counselorId: string): Promise<string[]> {
    const assignments = await this.prisma.counselorAssignment.findMany({
      where: { counselorId },
      select: { studentId: true }
    });

    return assignments.map(a => a.studentId);
  }

  private async calculateStudentMetrics(studentId: string, timeFilter?: any) {
    const where = timeFilter ? { userId: studentId, createdAt: timeFilter } : { userId: studentId };

    const [resumeCount, applicationCount, sessionCount, averageResumeScore] = await Promise.all([
      this.prisma.resume.count({ where }),
      this.prisma.application.count({ where }),
      this.prisma.counselingSession.count({
        where: {
          studentId,
          ...(timeFilter && { createdAt: timeFilter })
        }
      }),
      this.calculateAverageResumeScore(studentId, timeFilter)
    ]);

    const successfulApplications = await this.prisma.application.count({
      where: {
        userId: studentId,
        status: { in: [ApplicationStatus.OFFER, ApplicationStatus.INTERVIEW] },
        ...(timeFilter && { appliedAt: timeFilter })
      }
    });

    const applicationSuccessRate = applicationCount > 0 ? (successfulApplications / applicationCount) * 100 : 0;

    return {
      resumeCount,
      applicationCount,
      sessionCount,
      averageResumeScore,
      applicationSuccessRate,
      successfulApplications
    };
  }

  private async calculateProgressTrends(studentId: string) {
    // Implementation for calculating progress trends over time
    // This would involve complex aggregations and time-series data
    return {
      resumeScoreTrend: [],
      applicationTrend: [],
      skillsDevelopment: []
    };
  }

  private async calculateAverageResumeScore(studentId: string, timeFilter?: any): Promise<number> {
    const resumes = await this.prisma.resume.findMany({
      where: {
        userId: studentId,
        ...(timeFilter && { createdAt: timeFilter })
      }
    });

    if (resumes.length === 0) return 0;

    const totalScore = resumes.reduce((sum, resume) => {
      return sum + this.calculateResumeScore(resume);
    }, 0);

    return totalScore / resumes.length;
  }

  private calculateResumeScore(resume: any): number {
    // Simple scoring algorithm - can be enhanced with AI integration
    let score = 50; // Base score

    if (resume.skills && resume.skills.length > 5) score += 20;
    if (resume.experience) score += 20;
    if (resume.education) score += 10;

    return Math.min(100, score);
  }

  private getTimeFilter(timeframe: string) {
    const now = new Date();
    const filters: Record<string, Date> = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    return { gte: filters[timeframe] || filters.month };
  }

  private groupByTimePeriod<T>(
    items: T[],
    timeframe: string,
    valueExtractor: (item: T) => number
  ) {
    // Implementation for grouping data by time periods
    // This would involve complex date grouping logic
    return [];
  }

  private analyzeSkillsGaps(resumes: any[], applications: any[]) {
    // Extract all student skills
    const studentSkills = new Set<string>();
    resumes.forEach(resume => {
      if (resume.skills) {
        resume.skills.forEach((skill: string) => studentSkills.add(skill.toLowerCase()));
      }
    });

    // Extract all required job skills
    const jobSkills = new Set<string>();
    applications.forEach(app => {
      if (app.job.skills) {
        app.job.skills.forEach((skill: string) => jobSkills.add(skill.toLowerCase()));
      }
    });

    // Find missing skills
    const missingSkills = Array.from(jobSkills).filter(skill => !studentSkills.has(skill));
    const commonSkills = Array.from(jobSkills).filter(skill => studentSkills.has(skill));

    return {
      totalStudentSkills: studentSkills.size,
      totalJobSkills: jobSkills.size,
      commonSkills: commonSkills.length,
      missingSkills,
      skillsGapPercentage: jobSkills.size > 0 ? (missingSkills.length / jobSkills.size) * 100 : 0,
      recommendations: this.generateSkillRecommendations(missingSkills)
    };
  }

  private generateSkillRecommendations(missingSkills: string[]) {
    // Generate learning recommendations based on missing skills
    return missingSkills.slice(0, 10).map(skill => ({
      skill,
      priority: 'high',
      resources: [`Learn ${skill} online`, `Practice ${skill} projects`]
    }));
  }
}
