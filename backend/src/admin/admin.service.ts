import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { Resume, ResumeDocument } from '../resumes/schemas/resume.schema';
import { CounselorAssignment, CounselorAssignmentDocument } from '../common/schemas/counselor-assignment.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(CounselorAssignment.name) private assignmentModel: Model<CounselorAssignmentDocument>
  ) {}

  async getDashboardStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalStudents,
      totalCounselors,
      totalJobs,
      activeJobs,
      totalApplications,
      totalResumes,
      recentUsers,
      recentApplications
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ role: UserRole.STUDENT }),
      this.userModel.countDocuments({ role: UserRole.COUNSELOR }),
      this.jobModel.countDocuments(),
      this.jobModel.countDocuments({ isActive: true }),
      this.applicationModel.countDocuments(),
      this.resumeModel.countDocuments(),
      this.userModel.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      }),
      this.applicationModel.countDocuments({
        appliedAt: { $gte: oneWeekAgo }
      })
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        students: totalStudents,
        counselors: totalCounselors,
        newThisWeek: recentUsers
      },
      jobs: {
        total: totalJobs,
        active: activeJobs
      },
      applications: {
        total: totalApplications,
        newThisWeek: recentApplications
      },
      resumes: {
        total: totalResumes
      }
    };
  }

  async getUserAnalytics(period: string = '30d') {
    const days = this.parsePeriod(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      recentUsers,
      usersByRole,
      topUniversities
    ] = await Promise.all([
      this.userModel.countDocuments({
        createdAt: { $gte: startDate }
      }),
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      this.userModel.aggregate([
        { $match: { university: { $ne: null, $exists: true } } },
        { $group: { _id: '$university', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      period,
      recentRegistrations: recentUsers,
      usersByRole: usersByRole.map(u => ({ role: u._id, count: u.count })),
      topUniversities: topUniversities.map(u => ({ name: u._id, count: u.count }))
    };
  }

  async getAllUsers(page = 1, limit = 20, role?: UserRole) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the user's role and add role-specific fields if needed
    const updateData: any = { role: newRole };
    
    if (newRole === UserRole.COUNSELOR && !user.specialization) {
      updateData.specialization = [];
      updateData.experience = 0;
    }

    return await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .lean();
  }

  async deactivateUser(userId: string) {
    return await this.userModel
      .findByIdAndUpdate(userId, { isActive: false }, { new: true })
      .select('-password')
      .lean();
  }

  async activateUser(userId: string) {
    return await this.userModel
      .findByIdAndUpdate(userId, { isActive: true }, { new: true })
      .select('-password')
      .lean();
  }

  async assignStudentToCounselor(counselorId: string, studentId: string, notes?: string) {
    // Check if assignment already exists
    const existing = await this.assignmentModel
      .findOne({ counselorId, studentId })
      .lean();

    if (existing) {
      throw new BadRequestException('Assignment already exists');
    }

    // Verify counselor and student exist
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

    const assignment = await this.assignmentModel.create({
      counselorId,
      studentId,
      notes
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
    return { message: 'Assignment removed successfully' };
  }

  private parsePeriod(period: string): number {
    const match = period.match(/^(\d+)([dwmy])$/);
    if (!match) return 30; // default to 30 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }
}
