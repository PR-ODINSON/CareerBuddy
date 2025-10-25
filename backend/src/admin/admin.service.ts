import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { Resume, ResumeDocument } from '../resumes/schemas/resume.schema';
import { CounselorAssignment, CounselorAssignmentDocument } from '../common/schemas/counselor-assignment.schema';
import { CreateUserDto } from './dto/create-user.dto';

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

  async getUserGrowthData(period: string = '30d') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get all users created within the period
      const users = await this.userModel.find({
        createdAt: { $gte: startDate }
      }).select('createdAt').lean();

      // Group users by date
      const groupedData = new Map<string, number>();
      
      users.forEach((user: any) => {
        const dateKey = user.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format
        groupedData.set(dateKey, (groupedData.get(dateKey) || 0) + 1);
      });

      // Convert to array format for frontend
      const data = Array.from(groupedData.entries())
        .map(([date, count]) => ({
          date,
          count,
          displayDate: new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        period,
        data,
        totalNewUsers: users.length
      };
    } catch (error) {
      console.error('Error in getUserGrowthData:', error);
      // Return empty data if there's an error
      return {
        period,
        data: [],
        totalNewUsers: 0
      };
    }
  }

  async getJobAnalytics(period: string = '30d') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get job counts
      const [totalJobs, activeJobs, recentJobs] = await Promise.all([
        this.jobModel.countDocuments(),
        this.jobModel.countDocuments({ status: 'ACTIVE' }),
        this.jobModel.countDocuments({ createdAt: { $gte: startDate } })
      ]);

      const inactiveJobs = totalJobs - activeJobs;

      // Get jobs by type
      const jobsByType = await this.jobModel.aggregate([
        { $group: { _id: '$employmentType', count: { $sum: 1 } } }
      ]);

      // Get jobs by experience level
      const jobsByExperience = await this.jobModel.aggregate([
        { $group: { _id: '$experienceLevel', count: { $sum: 1 } } }
      ]);

      // Convert to object format
      const jobsByTypeObj: Record<string, number> = {};
      jobsByType.forEach(item => {
        jobsByTypeObj[item._id || 'UNKNOWN'] = item.count;
      });

      const jobsByExperienceObj: Record<string, number> = {};
      jobsByExperience.forEach(item => {
        jobsByExperienceObj[item._id || 'UNKNOWN'] = item.count;
      });

      return {
        totalJobs,
        activeJobs,
        inactiveJobs,
        recentJobs,
        jobsByType: jobsByTypeObj,
        jobsByExperience: jobsByExperienceObj
      };
    } catch (error) {
      console.error('Error in getJobAnalytics:', error);
      return {
        totalJobs: 0,
        activeJobs: 0,
        inactiveJobs: 0,
        recentJobs: 0,
        jobsByType: {},
        jobsByExperience: {}
      };
    }
  }

  async getResumeAnalytics(period: string = '30d') {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get resume counts
      const [totalResumes, recentResumes, analyzedResumes] = await Promise.all([
        this.resumeModel.countDocuments(),
        this.resumeModel.countDocuments({ createdAt: { $gte: startDate } }),
        this.resumeModel.countDocuments({ 'analysis.atsScore': { $exists: true } })
      ]);

      // Calculate average ATS score
      const avgScoreResult = await this.resumeModel.aggregate([
        { $match: { 'analysis.atsScore': { $exists: true, $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: '$analysis.atsScore' } } }
      ]);

      const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;
      const analysisRate = totalResumes > 0 ? (analyzedResumes / totalResumes) * 100 : 0;

      return {
        totalResumes,
        recentResumes,
        analyzedResumes,
        averageScore: Math.round(averageScore),
        analysisRate: Math.round(analysisRate)
      };
    } catch (error) {
      console.error('Error in getResumeAnalytics:', error);
      return {
        totalResumes: 0,
        recentResumes: 0,
        analyzedResumes: 0,
        averageScore: 0,
        analysisRate: 0
      };
    }
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

  async createUser(createUserDto: CreateUserDto) {
    try {
      
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).lean();
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Generate password if not provided
      const password = createUserDto.password || this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate required fields based on role
      if (createUserDto.role === UserRole.STUDENT) {
        if (!createUserDto.university || !createUserDto.major || !createUserDto.graduationYear) {
          throw new BadRequestException('University, major, and graduation year are required for students');
        }
      }

      // Create user data
      const userData: any = {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        phone: createUserDto.phone,
        bio: createUserDto.bio,
        isActive: true,
        isVerified: true, // Admin-created users are automatically verified
      };

      // Add role-specific fields
      if (createUserDto.role === UserRole.STUDENT) {
        userData.university = createUserDto.university;
        userData.major = createUserDto.major;
        userData.graduationYear = createUserDto.graduationYear;
        userData.gpa = createUserDto.gpa;
      } else if (createUserDto.role === UserRole.COUNSELOR) {
        userData.specialization = createUserDto.specialization || [];
        userData.experience = createUserDto.experience || 0;
        userData.certification = createUserDto.certification;
      }

      // Create user
      const user = await this.userModel.create(userData);

      // Return user without password
      const userResponse = await this.userModel
        .findById(user._id)
        .select('-password')
        .lean();

      return {
        message: 'User created successfully',
        user: userResponse,
        temporaryPassword: createUserDto.password ? undefined : password // Only return temp password if it was generated
      };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateUserDto: CreateUserDto) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate required fields based on role
    if (updateUserDto.role === UserRole.STUDENT) {
      if (!updateUserDto.university || !updateUserDto.major || !updateUserDto.graduationYear) {
        throw new BadRequestException('University, major, and graduation year are required for students');
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      role: updateUserDto.role,
      phone: updateUserDto.phone,
      bio: updateUserDto.bio,
    };

    // Handle password update if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Add role-specific fields
    if (updateUserDto.role === UserRole.STUDENT) {
      updateData.university = updateUserDto.university;
      updateData.major = updateUserDto.major;
      updateData.graduationYear = updateUserDto.graduationYear;
      updateData.gpa = updateUserDto.gpa;
      // Clear counselor-specific fields if switching from counselor to student
      updateData.specialization = undefined;
      updateData.experience = undefined;
      updateData.certification = undefined;
    } else if (updateUserDto.role === UserRole.COUNSELOR) {
      updateData.specialization = updateUserDto.specialization || [];
      updateData.experience = updateUserDto.experience || 0;
      updateData.certification = updateUserDto.certification;
      // Clear student-specific fields if switching from student to counselor
      updateData.university = undefined;
      updateData.major = undefined;
      updateData.graduationYear = undefined;
      updateData.gpa = undefined;
    }

    // Update user
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .lean();

    return {
      message: 'User updated successfully',
      user: updatedUser
    };
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is an admin - prevent deletion of admin users for safety
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot delete admin users');
    }

    // Delete related data first
    await Promise.all([
      // Delete user's applications
      this.applicationModel.deleteMany({ userId }),
      // Delete user's resumes
      this.resumeModel.deleteMany({ userId }),
      // Delete counselor assignments where user is involved
      this.assignmentModel.deleteMany({
        $or: [
          { counselorId: userId },
          { studentId: userId }
        ]
      })
    ]);

    // Finally delete the user
    await this.userModel.findByIdAndDelete(userId);

    return {
      message: 'User and all related data deleted successfully'
    };
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

  async testDatabaseConnection() {
    try {
      const [userCount, jobCount, applicationCount, resumeCount] = await Promise.all([
        this.userModel.countDocuments(),
        this.jobModel.countDocuments(),
        this.applicationModel.countDocuments(),
        this.resumeModel.countDocuments()
      ]);

      // Get a sample job to verify the structure
      const sampleJob = await this.jobModel.findOne().lean();

      return {
        success: true,
        message: 'Database connection successful',
        counts: {
          users: userCount,
          jobs: jobCount,
          applications: applicationCount,
          resumes: resumeCount
        },
        sampleJob: sampleJob ? {
          id: sampleJob._id,
          title: sampleJob.title,
          company: sampleJob.company,
          isActive: sampleJob.isActive
        } : null
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

}
