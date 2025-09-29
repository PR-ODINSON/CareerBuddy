import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AssignStudentDto } from './dto/assign-student.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

// Import schemas and enums
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Resume, ResumeDocument } from '../resumes/schemas/resume.schema';
import { ResumeFeedback, ResumeFeedbackDocument, FeedbackType, FeedbackSeverity } from '../resumes/schemas/resume.schema';
import { Application, ApplicationDocument, ApplicationStatus } from '../applications/schemas/application.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { CounselingSession, CounselingSessionDocument, SessionStatus } from '../common/schemas/analytics.schema';
import { CounselorAssignment, CounselorAssignmentDocument } from '../common/schemas/counselor-assignment.schema';

@Injectable()
export class CounselorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(ResumeFeedback.name) private resumeFeedbackModel: Model<ResumeFeedbackDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(CounselingSession.name) private sessionModel: Model<CounselingSessionDocument>,
    @InjectModel(CounselorAssignment.name) private assignmentModel: Model<CounselorAssignmentDocument>
  ) {}

  // ====== STUDENT MANAGEMENT ======

  async getAssignedStudents(counselorId: string, page: number = 1, limit: number = 20) {
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;

    const assignments = await this.assignmentModel
      .find({ counselorId })
      .populate({
        path: 'studentId',
        select: 'firstName lastName email university major graduationYear gpa',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await this.assignmentModel.countDocuments({ counselorId });

    const studentsWithData = await Promise.all(
      assignments.map(async (assignment: any) => {
        const resumes = await this.resumeModel
          .find({ userId: assignment.studentId._id, isActive: true })
          .sort({ updatedAt: -1 })
          .limit(1)
          .lean();

        const applications = await this.applicationModel
          .find({ userId: assignment.studentId._id })
          .sort({ appliedAt: -1 })
          .limit(5)
          .lean();

        return {
          assignment: {
            id: assignment._id,
            assignedAt: assignment.createdAt,
            notes: assignment.notes,
            expiresAt: assignment.expiresAt
          },
          student: {
            ...assignment.studentId,
            resumes,
            applications
          }
        };
      })
    );

    return {
      students: studentsWithData,
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

    const student = await this.userModel
      .findById(studentId)
      .select('-password')
      .lean();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [resumes, applications, sessions] = await Promise.all([
      this.resumeModel
        .find({ userId: studentId })
        .sort({ updatedAt: -1 })
        .lean(),
      this.applicationModel
        .find({ userId: studentId })
        .populate('jobId')
        .sort({ appliedAt: -1 })
        .lean(),
      this.sessionModel
        .find({ studentId, counselorId })
        .sort({ scheduledAt: -1 })
        .lean()
    ]);

    // Get feedback for resumes
    const resumeIds = resumes.map(r => r._id);
    const feedback = await this.resumeFeedbackModel
      .find({ resumeId: { $in: resumeIds }, counselorId })
      .sort({ createdAt: -1 })
      .lean();

    // Attach feedback to resumes
    const resumesWithFeedback = resumes.map(resume => ({
      ...resume,
      feedback: feedback.filter(f => f.resumeId.toString() === resume._id.toString())
    }));

    const metrics = await this.calculateStudentMetrics(studentId);

    return {
      student: {
        ...student,
        resumes: resumesWithFeedback,
        applications,
        sessions
      },
      metrics
    };
  }

  async getStudentResumes(counselorId: string, studentId: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const resumes = await this.resumeModel
      .find({ userId: studentId })
      .sort({ updatedAt: -1 })
      .lean();

    // Get feedback for each resume
    const resumesWithFeedback = await Promise.all(
      resumes.map(async (resume) => {
        const feedback = await this.resumeFeedbackModel
          .find({ resumeId: resume._id, counselorId })
          .sort({ createdAt: -1 })
          .lean();

        return { ...resume, feedback };
      })
    );

    return resumesWithFeedback;
  }

  async getStudentApplications(counselorId: string, studentId: string, status?: string) {
    await this.verifyStudentAssignment(counselorId, studentId);

    const filter: any = { userId: studentId };
    if (status) {
      filter.status = status;
    }

    const applications = await this.applicationModel
      .find(filter)
      .populate('jobId')
      .populate('resumeId')
      .sort({ appliedAt: -1 })
      .lean();

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

    const resume = await this.resumeModel.findById(resumeId).lean();
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const actualStudentId = studentId || resume.userId;
    await this.verifyStudentAssignment(counselorId, actualStudentId.toString());

    const feedback = await this.resumeFeedbackModel.create({
      ...feedbackData,
      resumeId,
      counselorId,
      isAiGenerated: false
    });

    return await this.resumeFeedbackModel
      .findById(feedback._id)
      .populate({
        path: 'resumeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .lean();
  }

  async getAllFeedback(
    counselorId: string,
    filters: { studentId?: string; resumeId?: string },
    page: number = 1,
    limit: number = 20
  ) {
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;
    const match: any = { counselorId };

    if (filters.resumeId) {
      match.resumeId = filters.resumeId;
    }

    let feedback;
    if (filters.studentId) {
      // Need to filter by student - use aggregation
      const resumeIds = await this.resumeModel
        .find({ userId: filters.studentId })
        .select('_id')
        .lean();

      match.resumeId = { $in: resumeIds.map(r => r._id) };
    }

    feedback = await this.resumeFeedbackModel
      .find(match)
      .populate({
        path: 'resumeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await this.resumeFeedbackModel.countDocuments(match);

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
    const feedback = await this.resumeFeedbackModel
      .findById(feedbackId)
      .populate({
        path: 'resumeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .lean();

    if (!feedback || feedback.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async updateFeedback(counselorId: string, feedbackId: string, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.resumeFeedbackModel.findById(feedbackId).lean();

    if (!feedback || feedback.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    return await this.resumeFeedbackModel
      .findByIdAndUpdate(feedbackId, updateFeedbackDto, { new: true })
      .populate({
        path: 'resumeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .lean();
  }

  async deleteFeedback(counselorId: string, feedbackId: string) {
    const feedback = await this.resumeFeedbackModel.findById(feedbackId).lean();

    if (!feedback || feedback.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Feedback not found');
    }

    await this.resumeFeedbackModel.findByIdAndDelete(feedbackId);
    return { message: 'Feedback deleted successfully' };
  }

  // ====== COUNSELING SESSIONS ======

  async createSession(counselorId: string, createSessionDto: CreateSessionDto) {
    await this.verifyStudentAssignment(counselorId, createSessionDto.studentId);

    const session = await this.sessionModel.create({
      ...createSessionDto,
      counselorId,
      scheduledAt: new Date(createSessionDto.scheduledAt)
    });

    return await this.sessionModel
      .findById(session._id)
      .populate('studentId', 'firstName lastName email')
      .populate('counselorId', 'firstName lastName email')
      .lean();
  }

  async getAllSessions(
    counselorId: string,
    filters: { status?: string; studentId?: string },
    page: number = 1,
    limit: number = 20
  ) {
    await this.verifyCounselor(counselorId);

    const skip = (page - 1) * limit;
    const match: any = { counselorId };

    if (filters.status) {
      match.status = filters.status;
    }

    if (filters.studentId) {
      match.studentId = filters.studentId;
    }

    const sessions = await this.sessionModel
      .find(match)
      .populate('studentId', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ scheduledAt: -1 })
      .lean();

    const total = await this.sessionModel.countDocuments(match);

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
    const session = await this.sessionModel
      .findById(sessionId)
      .populate('studentId', 'firstName lastName email university major graduationYear gpa')
      .populate('counselorId', 'firstName lastName email')
      .lean();

    if (!session || session.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async updateSession(counselorId: string, sessionId: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionModel.findById(sessionId).lean();

    if (!session || session.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    const updateData: any = { ...updateSessionDto };
    if (updateSessionDto.scheduledAt) {
      updateData.scheduledAt = new Date(updateSessionDto.scheduledAt);
    }

    return await this.sessionModel
      .findByIdAndUpdate(sessionId, updateData, { new: true })
      .populate('studentId', 'firstName lastName email')
      .lean();
  }

  async completeSession(
    counselorId: string,
    sessionId: string,
    sessionData: { notes?: string; feedback?: string; rating?: number }
  ) {
    const session = await this.sessionModel.findById(sessionId).lean();

    if (!session || session.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    return await this.sessionModel
      .findByIdAndUpdate(
        sessionId,
        {
          status: SessionStatus.COMPLETED,
          ...sessionData
        },
        { new: true }
      )
      .populate('studentId', 'firstName lastName email')
      .lean();
  }

  async cancelSession(counselorId: string, sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).lean();

    if (!session || session.counselorId.toString() !== counselorId) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionModel.findByIdAndUpdate(sessionId, { status: SessionStatus.CANCELLED });
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
      avgRating
    ] = await Promise.all([
      this.assignmentModel.countDocuments({ counselorId }),
      this.sessionModel.countDocuments({ counselorId }),
      this.sessionModel.countDocuments({
        counselorId,
        status: SessionStatus.SCHEDULED,
        scheduledAt: { $gte: new Date() }
      }),
      this.resumeFeedbackModel.countDocuments({
        counselorId,
        isResolved: false
      }),
      this.sessionModel.countDocuments({
        counselorId,
        status: SessionStatus.COMPLETED
      }),
      this.sessionModel.aggregate([
        { $match: { counselorId, rating: { $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const recentSessions = await this.sessionModel
      .find({ counselorId })
      .populate('studentId', 'firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const recentFeedback = await this.resumeFeedbackModel
      .find({ counselorId })
      .populate({
        path: 'resumeId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      stats: {
        totalStudents,
        totalSessions,
        upcomingSessions,
        pendingFeedback,
        completedSessions,
        averageRating: avgRating[0]?.avgRating || 0
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
    const assignments = await this.assignmentModel
      .find({ counselorId })
      .populate('studentId', 'firstName lastName email')
      .lean();

    const studentIds = assignments.map(a => a.studentId);

    const studentsPerformance = await Promise.all(
      studentIds.map(async (student: any) => {
        const metrics = await this.calculateStudentMetrics(student._id.toString(), timeFilter);
        return {
          student: {
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email
          },
          metrics
        };
      })
    );

    return studentsPerformance;
  }

  async getApplicationSuccess(counselorId: string, timeframe: string = 'month') {
    await this.verifyCounselor(counselorId);

    const timeFilter = this.getTimeFilter(timeframe);
    const studentIds = await this.getAssignedStudentIds(counselorId);

    const applications = await this.applicationModel
      .find({
        userId: { $in: studentIds },
        appliedAt: timeFilter
      })
      .populate('jobId')
      .populate('userId', 'firstName lastName')
      .lean();

    const total = applications.length;
    const successful = applications.filter(app =>
      app.status === ApplicationStatus.OFFER || app.status === ApplicationStatus.INTERVIEW
    ).length;

    const successRate = total > 0 ? (successful / total) * 100 : 0;

    const statusBreakdown = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      successRate,
      total,
      successful,
      statusBreakdown,
      applications: applications.slice(0, 20)
    };
  }

  // ====== ADMIN FUNCTIONS ======

  async assignStudent(assignStudentDto: AssignStudentDto) {
    const { counselorId, studentId, notes, expiresAt } = assignStudentDto;

    const [counselor, student] = await Promise.all([
      this.userModel.findOne({ _id: counselorId, role: UserRole.COUNSELOR }).lean(),
      this.userModel.findOne({ _id: studentId, role: UserRole.STUDENT }).lean()
    ]);

    if (!counselor) {
      throw new NotFoundException('Counselor not found');
    }

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const existingAssignment = await this.assignmentModel
      .findOne({ counselorId, studentId })
      .lean();

    if (existingAssignment) {
      throw new BadRequestException('Student is already assigned to this counselor');
    }

    const assignment = await this.assignmentModel.create({
      counselorId,
      studentId,
      notes,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return await this.assignmentModel
      .findById(assignment._id)
      .populate('counselorId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName email')
      .lean();
  }

  async removeStudentAssignment(counselorId: string, studentId: string) {
    const assignment = await this.assignmentModel
      .findOne({ counselorId, studentId })
      .lean();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.assignmentModel.findByIdAndDelete(assignment._id);
    return { message: 'Student assignment removed successfully' };
  }

  async getAllAssignments(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const assignments = await this.assignmentModel
      .find()
      .populate('counselorId', 'firstName lastName email specialization experience certification rating')
      .populate('studentId', 'firstName lastName email university major graduationYear gpa')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await this.assignmentModel.countDocuments();

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
    const counselor = await this.userModel.findById(counselorId).lean();

    if (!counselor || (counselor.role !== UserRole.COUNSELOR && counselor.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('Access denied: Counselor role required');
    }

    return counselor;
  }

  private async verifyStudentAssignment(counselorId: string, studentId: string) {
    const assignment = await this.assignmentModel
      .findOne({ counselorId, studentId })
      .lean();

    if (!assignment) {
      throw new ForbiddenException('Student is not assigned to this counselor');
    }

    return assignment;
  }

  private async getAssignedStudentIds(counselorId: string): Promise<string[]> {
    const assignments = await this.assignmentModel
      .find({ counselorId })
      .select('studentId')
      .lean();

    return assignments.map(a => a.studentId.toString());
  }

  private async calculateStudentMetrics(studentId: string, timeFilter?: any) {
    const match = timeFilter ? { userId: studentId, createdAt: timeFilter } : { userId: studentId };

    const [resumeCount, applicationCount, sessionCount, averageResumeScore] = await Promise.all([
      this.resumeModel.countDocuments(match),
      this.applicationModel.countDocuments(match),
      this.sessionModel.countDocuments({
        studentId,
        ...(timeFilter && { createdAt: timeFilter })
      }),
      this.calculateAverageResumeScore(studentId, timeFilter)
    ]);

    const successfulApplications = await this.applicationModel.countDocuments({
      userId: studentId,
      status: { $in: [ApplicationStatus.OFFER, ApplicationStatus.INTERVIEW] },
      ...(timeFilter && { appliedAt: timeFilter })
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
    return {
      resumeScoreTrend: [],
      applicationTrend: [],
      skillsDevelopment: []
    };
  }

  private async calculateAverageResumeScore(studentId: string, timeFilter?: any): Promise<number> {
    const match: any = { userId: studentId };
    if (timeFilter) {
      match.createdAt = timeFilter;
    }

    const resumes = await this.resumeModel.find(match).lean();

    if (resumes.length === 0) return 0;

    const totalScore = resumes.reduce((sum, resume) => {
      return sum + this.calculateResumeScore(resume);
    }, 0);

    return totalScore / resumes.length;
  }

  private calculateResumeScore(resume: any): number {
    let score = 50;

    if (resume.skills && resume.skills.length > 5) score += 20;
    if (resume.experience) score += 20;
    if (resume.education) score += 10;

    return Math.min(100, score);
  }

  async getResumeTrends(counselorId: string, timeframe: string = 'month') {
    await this.verifyCounselor(counselorId);

    const timeFilter = this.getTimeFilter(timeframe);
    const studentIds = await this.getAssignedStudentIds(counselorId);

    // Resume quality trends
    const resumes = await this.resumeModel
      .find({
        userId: { $in: studentIds },
        createdAt: timeFilter
      })
      .sort({ createdAt: 1 })
      .lean();

    // Group by time periods and calculate average scores
    const trends = this.groupByTimePeriod(resumes, timeframe, (resume) => {
      return this.calculateResumeScore(resume);
    });

    return trends;
  }

  async getSkillsGapAnalysis(counselorId: string) {
    await this.verifyCounselor(counselorId);

    const studentIds = await this.getAssignedStudentIds(counselorId);

    // Get all resumes for assigned students
    const resumes = await this.resumeModel
      .find({ userId: { $in: studentIds } })
      .select('skills userId')
      .lean();

    // Get all job applications to see what skills are in demand
    const applications = await this.applicationModel
      .find({ userId: { $in: studentIds } })
      .populate('jobId', 'skills requirements')
      .lean();

    // Analyze skills gaps
    const skillsAnalysis = this.analyzeSkillsGaps(resumes, applications);

    return skillsAnalysis;
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
      if (app.jobId && app.jobId.skills) {
        app.jobId.skills.forEach((skill: string) => jobSkills.add(skill.toLowerCase()));
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

  private getTimeFilter(timeframe: string) {
    const now = new Date();
    const filters: Record<string, Date> = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      quarter: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    return { $gte: filters[timeframe] || filters.month };
  }
}
