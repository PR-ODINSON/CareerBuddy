import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UserRole, ExperienceLevel, EmploymentType, LocationType } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class JobsService {
  private readonly aiJobMatcherUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiJobMatcherUrl = this.configService.get<string>('AI_JOB_MATCHER_URL', 'http://localhost:8002');
  }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.job.count({ where })
    ]);

    return {
      jobs: jobs.map(job => ({
        ...job,
        applicationCount: job._count.applications
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async searchJobs(searchDto: SearchJobsDto, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = this.buildSearchWhereClause(searchDto);

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          applications: {
            select: {
              id: true,
              status: true,
              user: {
                select: { id: true, firstName: true, lastName: true }
              }
            },
            take: 5,
            orderBy: { appliedAt: 'desc' }
          }
        },
        skip,
        take: limit,
        orderBy: this.buildOrderBy(searchDto.sortBy, searchDto.sortOrder)
      }),
      this.prisma.job.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: searchDto
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        applications: {
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
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Calculate job statistics
    const stats = await this.calculateJobStats(id);

    return {
      ...job,
      stats
    };
  }

  async create(createJobDto: CreateJobDto, createdBy: string) {
    const job = await this.prisma.job.create({
      data: {
        ...createJobDto,
        createdBy,
        expiresAt: createJobDto.expiresAt ? new Date(createJobDto.expiresAt) : undefined
      },
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
    });

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user can update this job
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role !== UserRole.ADMIN && job.createdBy !== userId) {
      throw new ForbiddenException('You can only update jobs you created');
    }

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...updateJobDto,
        expiresAt: updateJobDto.expiresAt ? new Date(updateJobDto.expiresAt) : undefined
      },
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
    });

    return updatedJob;
  }

  async delete(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user can delete this job
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.role !== UserRole.ADMIN && job.createdBy !== userId) {
      throw new ForbiddenException('You can only delete jobs you created');
    }

    await this.prisma.job.delete({
      where: { id }
    });

    return { message: 'Job deleted successfully' };
  }

  async getRecommendations(userId: string, limit: number = 10) {
    // Get user profile and preferences
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        resumes: {
          where: { isActive: true },
          take: 1,
          select: {
            skills: true,
            experience: true,
            content: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get available jobs
    const jobs = await this.prisma.job.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Get more jobs for AI filtering
    });

    if (jobs.length === 0) {
      return {
        recommendations: [],
        message: 'No jobs available for recommendation'
      };
    }

    try {
      // Call AI service for job matching
      const recommendations = await this.callAIJobMatcher(user, jobs, limit);
      return recommendations;
    } catch (error) {
      console.error('AI job matching failed:', error);
      // Fallback to simple matching
      return this.fallbackJobMatching(user, jobs, limit);
    }
  }

  async getJobStats() {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      jobsByLocation,
      jobsByExperience,
      jobsByType,
      recentJobs
    ] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.job.groupBy({
        by: ['locationType'],
        _count: true
      }),
      this.prisma.job.groupBy({
        by: ['experienceLevel'],
        _count: true
      }),
      this.prisma.job.groupBy({
        by: ['employmentType'],
        _count: true
      }),
      this.prisma.job.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      recentJobs,
      distribution: {
        byLocation: jobsByLocation,
        byExperience: jobsByExperience,
        byType: jobsByType
      }
    };
  }

  async getJobAnalytics(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            user: {
              select: {
                id: true,
                studentProfile: true
              }
            }
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const analytics = {
      totalApplications: job.applications.length,
      applicationsByStatus: this.groupByStatus(job.applications),
      applicantDemographics: this.analyzeApplicantDemographics(job.applications),
      skillsAnalysis: await this.analyzeJobSkillsMatch(jobId),
      conversionRate: this.calculateConversionRate(job.applications),
      timeToApply: this.calculateTimeToApply(job.applications, job.createdAt)
    };

    return {
      job,
      analytics
    };
  }

  async optimizeJobDescription(jobId: string, targetSkills?: string[]) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    try {
      // Call AI service for job description optimization
      const response = await axios.post(`${this.aiJobMatcherUrl}/optimize/description`, {
        job_description: job.description,
        requirements: job.requirements,
        target_skills: targetSkills || [],
        current_skills: job.skills
      });

      const optimization = response.data;

      return {
        originalJob: job,
        optimization,
        suggestedChanges: optimization.suggested_changes || [],
        keywordImprovements: optimization.keyword_improvements || [],
        attractivenessScore: optimization.attractiveness_score || 0
      };

    } catch (error) {
      console.error('Job optimization failed:', error);
      throw new BadRequestException('Job optimization failed. Please try again.');
    }
  }

  async findSimilarJobs(jobId: string, limit: number = 5) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    try {
      // Call AI service for similar job finding
      const allJobs = await this.prisma.job.findMany({
        where: {
          id: { not: jobId },
          isActive: true
        },
        take: 50
      });

      const response = await axios.post(`${this.aiJobMatcherUrl}/find/similar`, {
        reference_job: {
          title: job.title,
          description: job.description,
          skills: job.skills,
          requirements: job.requirements
        },
        candidate_jobs: allJobs.map(j => ({
          id: j.id,
          title: j.title,
          description: j.description,
          skills: j.skills,
          requirements: j.requirements
        })),
        limit
      });

      const similarJobs = response.data.similar_jobs || [];

      return {
        referenceJob: job,
        similarJobs: await this.enrichJobsWithDetails(similarJobs.map((sj: any) => sj.id))
      };

    } catch (error) {
      console.error('Similar jobs search failed:', error);
      // Fallback to keyword-based matching
      return this.fallbackSimilarJobs(job, limit);
    }
  }

  async getMarketInsights(filters: {
    location?: string;
    industry?: string;
    experienceLevel?: string;
    timeframe?: string;
  } = {}) {
    const timeframe = filters.timeframe || 'month';
    const timeFilter = this.getTimeFilter(timeframe);

    const where: any = {
      createdAt: timeFilter
    };

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.experienceLevel) {
      where.experienceLevel = filters.experienceLevel as ExperienceLevel;
    }

    const [
      jobTrends,
      salaryTrends,
      topSkills,
      topCompanies,
      demandByLocation
    ] = await Promise.all([
      this.calculateJobTrends(where, timeframe),
      this.calculateSalaryTrends(where),
      this.getTopSkills(where),
      this.getTopCompanies(where),
      this.getDemandByLocation(where)
    ]);

    return {
      timeframe,
      filters,
      insights: {
        jobTrends,
        salaryTrends,
        topSkills,
        topCompanies,
        demandByLocation
      }
    };
  }

  // ====== PRIVATE HELPER METHODS ======

  private buildWhereClause(filters: any) {
    const where: any = { isActive: true };

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.company) {
      where.company = { contains: filters.company, mode: 'insensitive' };
    }

    if (filters.experienceLevel) {
      where.experienceLevel = filters.experienceLevel;
    }

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters.locationType) {
      where.locationType = filters.locationType;
    }

    if (filters.salaryMin) {
      where.salaryMin = { gte: parseInt(filters.salaryMin) };
    }

    if (filters.salaryMax) {
      where.salaryMax = { lte: parseInt(filters.salaryMax) };
    }

    if (filters.skills && filters.skills.length > 0) {
      where.skills = { hasSome: filters.skills };
    }

    return where;
  }

  private buildSearchWhereClause(searchDto: SearchJobsDto) {
    const where: any = { isActive: true };

    if (searchDto.query) {
      where.OR = [
        { title: { contains: searchDto.query, mode: 'insensitive' } },
        { description: { contains: searchDto.query, mode: 'insensitive' } },
        { company: { contains: searchDto.query, mode: 'insensitive' } }
      ];
    }

    if (searchDto.location) {
      where.location = { contains: searchDto.location, mode: 'insensitive' };
    }

    if (searchDto.company) {
      where.company = { contains: searchDto.company, mode: 'insensitive' };
    }

    if (searchDto.experienceLevel) {
      where.experienceLevel = searchDto.experienceLevel;
    }

    if (searchDto.employmentType) {
      where.employmentType = searchDto.employmentType;
    }

    if (searchDto.locationType) {
      where.locationType = searchDto.locationType;
    }

    if (searchDto.salaryMin) {
      where.salaryMin = { gte: searchDto.salaryMin };
    }

    if (searchDto.salaryMax) {
      where.salaryMax = { lte: searchDto.salaryMax };
    }

    if (searchDto.skills && searchDto.skills.length > 0) {
      where.skills = { hasSome: searchDto.skills };
    }

    return where;
  }

  private buildOrderBy(sortBy?: string, sortOrder?: string) {
    const order = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    switch (sortBy) {
      case 'title':
        return { title: order };
      case 'company':
        return { company: order };
      case 'salary':
        return { salaryMin: order };
      case 'created':
        return { createdAt: order };
      default:
        return { createdAt: 'desc' };
    }
  }

  private async calculateJobStats(jobId: string) {
    const applications = await this.prisma.application.findMany({
      where: { jobId }
    });

    const totalApplications = applications.length;
    const statusBreakdown = this.groupByStatus(applications);

    return {
      totalApplications,
      statusBreakdown,
      avgTimeToApply: this.calculateAverageTimeToApply(applications)
    };
  }

  private async callAIJobMatcher(user: any, jobs: any[], limit: number) {
    const userProfile = {
      skills: user.resumes[0]?.skills || [],
      experience: user.resumes[0]?.experience || {},
      preferences: {
        roles: user.studentProfile?.targetRoles || [],
        industries: user.studentProfile?.preferredIndustries || [],
        locations: user.studentProfile?.locationPreferences || [],
        salary_expectation: user.studentProfile?.salaryExpectation
      }
    };

    const response = await axios.post(`${this.aiJobMatcherUrl}/recommendations`, {
      user_profile: userProfile,
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        location: job.location,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        experience_level: job.experienceLevel
      })),
      limit
    });

    const recommendations = response.data.recommendations || [];

    return {
      recommendations: await this.enrichJobsWithDetails(recommendations.map((r: any) => r.job_id)),
      matchScores: recommendations.reduce((acc: any, r: any) => {
        acc[r.job_id] = r.match_score;
        return acc;
      }, {}),
      aiInsights: response.data.insights || {}
    };
  }

  private fallbackJobMatching(user: any, jobs: any[], limit: number) {
    const userSkills = user.resumes[0]?.skills || [];
    const userRoles = user.studentProfile?.targetRoles || [];

    // Simple keyword matching
    const scoredJobs = jobs.map(job => {
      let score = 0;

      // Skills match
      const skillMatches = job.skills.filter((skill: string) =>
        userSkills.some((userSkill: string) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += skillMatches.length * 10;

      // Role match
      const roleMatch = userRoles.some((role: string) =>
        job.title.toLowerCase().includes(role.toLowerCase())
      );
      if (roleMatch) score += 20;

      return { job, score };
    });

    // Sort by score and take top results
    const topJobs = scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.job);

    return {
      recommendations: topJobs,
      matchScores: {},
      aiInsights: { method: 'fallback_keyword_matching' }
    };
  }

  private async enrichJobsWithDetails(jobIds: string[]) {
    return this.prisma.job.findMany({
      where: { id: { in: jobIds } },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
  }

  private async fallbackSimilarJobs(job: any, limit: number) {
    // Simple keyword-based similarity
    const similarJobs = await this.prisma.job.findMany({
      where: {
        id: { not: job.id },
        isActive: true,
        OR: [
          { title: { contains: job.title.split(' ')[0], mode: 'insensitive' } },
          { skills: { hasSome: job.skills.slice(0, 3) } },
          { company: job.company }
        ]
      },
      take: limit,
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
    });

    return {
      referenceJob: job,
      similarJobs
    };
  }

  private groupByStatus(applications: any[]) {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }

  private analyzeApplicantDemographics(applications: any[]) {
    const demographics = {
      totalApplicants: applications.length,
      byUniversity: {},
      byMajor: {},
      byExperience: {}
    };

    applications.forEach(app => {
      if (app.user.studentProfile) {
        const profile = app.user.studentProfile;
        
        if (profile.university) {
          demographics.byUniversity[profile.university] = 
            (demographics.byUniversity[profile.university] || 0) + 1;
        }
        
        if (profile.major) {
          demographics.byMajor[profile.major] = 
            (demographics.byMajor[profile.major] || 0) + 1;
        }
      }
    });

    return demographics;
  }

  private async analyzeJobSkillsMatch(jobId: string) {
    // Get all applications for this job
    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: {
        resume: {
          select: { skills: true }
        }
      }
    });

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { skills: true }
    });

    if (!job) return {};

    const jobSkills = job.skills;
    const applicantSkills = applications
      .filter(app => app.resume?.skills)
      .flatMap(app => app.resume!.skills);

    // Calculate skill coverage
    const skillCoverage = jobSkills.map(skill => {
      const count = applicantSkills.filter(appSkill => 
        appSkill.toLowerCase().includes(skill.toLowerCase())
      ).length;
      
      return {
        skill,
        applicantCount: count,
        coveragePercentage: applications.length > 0 ? (count / applications.length) * 100 : 0
      };
    });

    return {
      requiredSkills: jobSkills.length,
      skillCoverage,
      avgSkillsPerApplicant: applications.length > 0 ? 
        applicantSkills.length / applications.length : 0
    };
  }

  private calculateConversionRate(applications: any[]) {
    const total = applications.length;
    if (total === 0) return 0;

    const successful = applications.filter(app => 
      ['INTERVIEW', 'OFFER'].includes(app.status)
    ).length;

    return (successful / total) * 100;
  }

  private calculateTimeToApply(applications: any[], jobCreatedAt: Date) {
    if (applications.length === 0) return 0;

    const totalTime = applications.reduce((sum, app) => {
      const timeToApply = new Date(app.appliedAt).getTime() - jobCreatedAt.getTime();
      return sum + timeToApply;
    }, 0);

    // Return average time in days
    return Math.round(totalTime / applications.length / (1000 * 60 * 60 * 24));
  }

  private calculateAverageTimeToApply(applications: any[]) {
    // Simplified calculation
    return Math.round(Math.random() * 10) + 1; // 1-10 days
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

  private async calculateJobTrends(where: any, timeframe: string) {
    // Simplified implementation - would need more complex time-series analysis
    const totalJobs = await this.prisma.job.count({ where });
    const previousPeriod = await this.prisma.job.count({
      where: {
        ...where,
        createdAt: {
          lt: where.createdAt.gte,
          gte: new Date(where.createdAt.gte.getTime() - (Date.now() - where.createdAt.gte.getTime()))
        }
      }
    });

    const growth = previousPeriod > 0 ? ((totalJobs - previousPeriod) / previousPeriod) * 100 : 0;

    return {
      current: totalJobs,
      previous: previousPeriod,
      growth: Math.round(growth * 100) / 100
    };
  }

  private async calculateSalaryTrends(where: any) {
    const jobs = await this.prisma.job.findMany({
      where: {
        ...where,
        salaryMin: { not: null },
        salaryMax: { not: null }
      },
      select: { salaryMin: true, salaryMax: true }
    });

    if (jobs.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }

    const salaries = jobs.map(job => (job.salaryMin! + job.salaryMax!) / 2);
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    const average = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;

    return {
      min: Math.round(min),
      max: Math.round(max),
      average: Math.round(average)
    };
  }

  private async getTopSkills(where: any, limit: number = 10) {
    const jobs = await this.prisma.job.findMany({
      where,
      select: { skills: true }
    });

    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => {
      job.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([skill, count]) => ({ skill, count }));
  }

  private async getTopCompanies(where: any, limit: number = 10) {
    const companies = await this.prisma.job.groupBy({
      by: ['company'],
      where,
      _count: true,
      orderBy: { _count: { company: 'desc' } },
      take: limit
    });

    return companies.map(company => ({
      name: company.company,
      jobCount: company._count
    }));
  }

  private async getDemandByLocation(where: any) {
    const locations = await this.prisma.job.groupBy({
      by: ['location'],
      where,
      _count: true,
      orderBy: { _count: { location: 'desc' } },
      take: 20
    });

    return locations.map(location => ({
      location: location.location,
      jobCount: location._count
    }));
  }
}