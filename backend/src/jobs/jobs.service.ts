import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { UserRole } from '../users/schemas/user.schema';

export interface JobRecommendationRequest {
  skills: string[];
  experience_years: number;
  ats_score: number;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  match_score: number;
  matching_skills: string[];
  salary_range?: string;
  experience_level: string;
  job_type: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    try {
      this.logger.log(`Finding jobs with filters: ${JSON.stringify(filters)}, page: ${page}, limit: ${limit}`);
      
      const skip = (page - 1) * limit;
      
      const jobs = await this.jobModel
        .find(filters)
        .populate('createdBy', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await this.jobModel.countDocuments(filters);

      this.logger.log(`Found ${jobs.length} jobs out of ${total} total`);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async search(searchDto: SearchJobsDto) {
    const { page = 1, limit = 20, query: searchQuery, company, location, employmentType, experienceLevel, skills } = searchDto;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { company: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (employmentType) {
      query.employmentType = employmentType;
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    const jobs = await this.jobModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await this.jobModel.countDocuments(query);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const job = await this.jobModel.findById(id).lean();
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async create(createJobDto: CreateJobDto, userId: string) {
    const job = new this.jobModel({
      ...createJobDto,
      createdBy: userId,
    });
    return job.save();
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string, userRole: UserRole) {
    const job = await this.jobModel.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user can update this job
    if (userRole !== UserRole.ADMIN && job.createdBy.toString() !== userId) {
      throw new BadRequestException('You can only update your own job postings');
    }

    return this.jobModel.findByIdAndUpdate(id, updateJobDto, { new: true });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const job = await this.jobModel.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if user can delete this job
    if (userRole !== UserRole.ADMIN && job.createdBy.toString() !== userId) {
      throw new BadRequestException('You can only delete your own job postings');
    }

    await this.jobModel.findByIdAndDelete(id);
    return { message: 'Job deleted successfully' };
  }

  async getJobStats() {
    const totalJobs = await this.jobModel.countDocuments();
    const activeJobs = await this.jobModel.countDocuments({ status: 'active' });
    const jobsByType = await this.jobModel.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);
    const jobsByLocation = await this.jobModel.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      totalJobs,
      activeJobs,
      jobsByType,
      jobsByLocation
    };
  }

  // Overloaded method for different recommendation types
  async getRecommendations(request: JobRecommendationRequest): Promise<JobRecommendation[]>;
  async getRecommendations(userId: string, limit: number): Promise<any[]>;
  async getRecommendations(requestOrUserId: JobRecommendationRequest | string, limit?: number): Promise<JobRecommendation[] | any[]> {
    if (typeof requestOrUserId === 'string') {
      // User-based recommendations (existing method)
      return this.getUserBasedRecommendations(requestOrUserId, limit || 10);
    } else {
      // Resume-based recommendations (new method)
      return this.getResumeBasedRecommendations(requestOrUserId);
    }
  }

  private async getUserBasedRecommendations(userId: string, limit: number): Promise<any[]> {
    // TODO: Implement user-based recommendations
    // For now, return empty array
    return [];
  }

  private async getResumeBasedRecommendations(request: JobRecommendationRequest): Promise<JobRecommendation[]> {
    try {
      // First, try to get real jobs from database
      const realJobRecommendations = await this.getRecommendationsFromDatabase(request);
      
      if (realJobRecommendations.length > 0) {
        this.logger.log(`Found ${realJobRecommendations.length} real job recommendations from database`);
        return realJobRecommendations;
      }
      
      // Fall back to mock recommendations if no real jobs found
      const mockRecommendations = this.generateMockRecommendations(request);
      this.logger.log(`Generated ${mockRecommendations.length} mock job recommendations (no real jobs in database)`);
      return mockRecommendations;
    } catch (error) {
      this.logger.error('Error generating job recommendations:', error);
      return [];
    }
  }

  private async getRecommendationsFromDatabase(request: JobRecommendationRequest): Promise<JobRecommendation[]> {
    const { skills, experience_years, ats_score } = request;
    
    // Get all active jobs from database
    const jobs = await this.jobModel.find({ 
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    }).lean();

    if (jobs.length === 0) {
      return [];
    }

    const recommendations: JobRecommendation[] = [];
    
    for (const job of jobs) {
      // Calculate match score based on skills and experience
      const matchingSkills = this.findMatchingSkills(skills, job.skills || []);
      const matchScore = this.calculateMatchScore(
        matchingSkills.length, 
        job.skills?.length || 1, 
        ats_score,
        experience_years,
        job.experienceLevel
      );
      
      // Only include jobs with at least 30% match for real jobs (higher threshold)
      if (matchScore >= 30) {
        recommendations.push({
          id: job._id.toString(),
          title: job.title,
          company: job.company,
          location: job.location,
          match_score: matchScore,
          matching_skills: matchingSkills,
          salary_range: this.formatSalaryRange(job.salaryMin, job.salaryMax),
          experience_level: job.experienceLevel,
          job_type: job.employmentType
        });
      }
    }

    // Sort by match score and return top 6
    return recommendations
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);
  }

  private formatSalaryRange(salaryMin?: number, salaryMax?: number): string {
    if (!salaryMin && !salaryMax) {
      return 'Salary not disclosed';
    }
    
    const formatINR = (amount: number) => {
      if (amount >= 10000000) { // 1 crore
        return `₹${(amount / 10000000).toFixed(1)} Cr`;
      } else if (amount >= 100000) { // 1 lakh
        return `₹${(amount / 100000).toFixed(1)} L`;
      } else {
        return `₹${amount.toLocaleString('en-IN')}`;
      }
    };

    if (salaryMin && salaryMax) {
      return `${formatINR(salaryMin)} - ${formatINR(salaryMax)}`;
    } else if (salaryMin) {
      return `${formatINR(salaryMin)}+`;
    } else {
      return `Up to ${formatINR(salaryMax!)}`;
    }
  }

  private generateMockRecommendations(request: JobRecommendationRequest): JobRecommendation[] {
    const { skills, experience_years, ats_score } = request;
    
    // Define job templates based on Indian market and common skills
    const jobTemplates = [
      {
        title: 'Software Engineer',
        company: 'TechMahindra',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹8,00,000 - ₹15,00,000',
        required_skills: ['javascript', 'react', 'node.js', 'python', 'java', 'typescript']
      },
      {
        title: 'Frontend Developer',
        company: 'Flipkart',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹6,00,000 - ₹12,00,000',
        required_skills: ['javascript', 'react', 'vue', 'angular', 'css', 'html', 'typescript']
      },
      {
        title: 'Backend Developer',
        company: 'Paytm',
        location: 'Noida, Uttar Pradesh',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹7,00,000 - ₹14,00,000',
        required_skills: ['python', 'java', 'node.js', 'sql', 'mongodb', 'postgresql', 'api']
      },
      {
        title: 'Full Stack Developer',
        company: 'Zomato',
        location: 'Gurgaon, Haryana',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹9,00,000 - ₹18,00,000',
        required_skills: ['javascript', 'react', 'node.js', 'python', 'sql', 'mongodb', 'aws']
      },
      {
        title: 'DevOps Engineer',
        company: 'Swiggy',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹10,00,000 - ₹20,00,000',
        required_skills: ['aws', 'docker', 'kubernetes', 'jenkins', 'terraform', 'linux', 'python']
      },
      {
        title: 'Data Analyst',
        company: 'Ola',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹5,00,000 - ₹10,00,000',
        required_skills: ['python', 'sql', 'excel', 'tableau', 'powerbi', 'statistics', 'pandas']
      },
      {
        title: 'Mobile Developer',
        company: 'PhonePe',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹8,00,000 - ₹16,00,000',
        required_skills: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'javascript']
      },
      {
        title: 'UI/UX Designer',
        company: 'BYJU\'S',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹4,50,000 - ₹9,00,000',
        required_skills: ['figma', 'sketch', 'adobe', 'prototyping', 'user research', 'wireframing']
      },
      {
        title: 'Java Developer',
        company: 'Infosys',
        location: 'Pune, Maharashtra',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹6,50,000 - ₹13,00,000',
        required_skills: ['java', 'spring', 'hibernate', 'mysql', 'microservices', 'rest api']
      },
      {
        title: 'Python Developer',
        company: 'Razorpay',
        location: 'Bangalore, Karnataka',
        experience_level: this.getExperienceLevel(experience_years),
        job_type: 'Full-time',
        salary_range: '₹7,50,000 - ₹15,00,000',
        required_skills: ['python', 'django', 'flask', 'postgresql', 'redis', 'celery', 'aws']
      }
    ];

    // Calculate match scores and filter relevant jobs
    const recommendations: JobRecommendation[] = [];
    
    for (const template of jobTemplates) {
      const matchingSkills = this.findMatchingSkills(skills, template.required_skills);
      const matchScore = this.calculateMatchScore(matchingSkills.length, template.required_skills.length, ats_score);
      
      // Only include jobs with at least 20% match
      if (matchScore >= 20) {
        recommendations.push({
          id: `mock-${template.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          title: template.title,
          company: template.company,
          location: template.location,
          match_score: matchScore,
          matching_skills: matchingSkills,
          salary_range: template.salary_range,
          experience_level: template.experience_level,
          job_type: template.job_type
        });
      }
    }

    // Sort by match score (highest first) and return top 6
    return recommendations
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 6);
  }

  private findMatchingSkills(userSkills: string[], jobSkills: string[]): string[] {
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase());
    
    return jobSkills.filter(jobSkill => 
      normalizedUserSkills.some(userSkill => 
        userSkill.includes(jobSkill.toLowerCase()) || 
        jobSkill.toLowerCase().includes(userSkill)
      )
    );
  }

  private calculateMatchScore(matchingCount: number, totalRequired: number, atsScore: number, userExperience?: number, jobExperienceLevel?: string): number {
    const skillMatch = (matchingCount / totalRequired) * 50; // 50% weight for skills
    const atsBonus = (atsScore / 100) * 30; // 30% weight for ATS score
    
    // Experience level matching (20% weight)
    let experienceMatch = 0;
    if (userExperience !== undefined && jobExperienceLevel) {
      experienceMatch = this.matchExperienceLevel(userExperience, jobExperienceLevel) * 20;
    }
    
    return Math.round(skillMatch + atsBonus + experienceMatch);
  }

  private matchExperienceLevel(userYears: number, jobLevel: string): number {
    const levelMap = {
      'ENTRY': { min: 0, max: 1 },
      'JUNIOR': { min: 0, max: 3 },
      'MID': { min: 2, max: 6 },
      'SENIOR': { min: 5, max: 10 },
      'LEAD': { min: 8, max: 15 },
      'EXECUTIVE': { min: 12, max: 25 }
    };

    const range = levelMap[jobLevel as keyof typeof levelMap];
    if (!range) return 0.5; // Default moderate match

    if (userYears >= range.min && userYears <= range.max) {
      return 1.0; // Perfect match
    } else if (userYears >= range.min - 1 && userYears <= range.max + 2) {
      return 0.8; // Close match
    } else if (userYears >= range.min - 2 && userYears <= range.max + 4) {
      return 0.6; // Reasonable match
    } else {
      return 0.3; // Poor match
    }
  }

  private getExperienceLevel(years: number): string {
    if (years === 0) return 'Entry Level';
    if (years <= 2) return 'Junior';
    if (years <= 5) return 'Mid Level';
    if (years <= 8) return 'Senior';
    return 'Lead/Principal';
  }
}