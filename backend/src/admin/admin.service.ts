import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
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
      recentApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.COUNSELOR } }),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.resume.count(),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      this.prisma.application.count({
        where: {
          appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        students: totalStudents,
        counselors: totalCounselors,
        newThisWeek: recentUsers,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      applications: {
        total: totalApplications,
        newThisWeek: recentApplications,
      },
      resumes: {
        total: totalResumes,
      },
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
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      this.prisma.studentProfile.groupBy({
        by: ['university'],
        where: { university: { not: null } },
        _count: true,
        orderBy: { _count: { university: 'desc' } },
        take: 10
      })
    ]);

    return {
      period,
      recentRegistrations: recentUsers,
      usersByRole: usersByRole.map(u => ({ role: u.role, count: u._count })),
      topUniversities: topUniversities.map(u => ({ name: u.university, count: u._count }))
    };
  }

  async getAllUsers(page = 1, limit = 20, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          studentProfile: true,
          counselorProfile: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create profile if needed
    if (newRole === UserRole.STUDENT && !user.studentProfile) {
      await this.prisma.studentProfile.create({
        data: { userId }
      });
    } else if (newRole === UserRole.COUNSELOR && !user.counselorProfile) {
      await this.prisma.counselorProfile.create({
        data: { userId }
      });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      include: {
        studentProfile: true,
        counselorProfile: true
      }
    });
  }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
  }

  async assignStudentToCounselor(counselorId: string, studentId: string, notes?: string) {
    // Check if assignment already exists
    const existing = await this.prisma.counselorAssignment.findUnique({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Assignment already exists');
    }

    return this.prisma.counselorAssignment.create({
      data: {
        counselorId,
        studentId,
        notes
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
  }

  async removeStudentAssignment(counselorId: string, studentId: string) {
    return this.prisma.counselorAssignment.delete({
      where: {
        counselorId_studentId: {
          counselorId,
          studentId
        }
      }
    });
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
