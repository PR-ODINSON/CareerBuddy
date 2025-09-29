import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class JobsService {
  private readonly aiJobMatcherUrl: string;

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private configService: ConfigService,
  ) {
    this.aiJobMatcherUrl = this.configService.get<string>('AI_JOB_MATCHER_URL', 'http://localhost:8002');
  }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}) {
    const skip = (page - 1) * limit;
    
    const query: any = { isActive: true };
    
    if (filters.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }
    
    if (filters.company) {
      query.company = { $regex: filters.company, $options: 'i' };
    }
    
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    const [jobs, total] = await Promise.all([
      this.jobModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.jobModel.countDocuments(query)
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

  async create(createJobDto: CreateJobDto, createdBy: string) {
    const job = await this.jobModel.create({
      ...createJobDto,
      createdBy
    });

    return job.toObject();
  }

  async update(id: string, updateJobDto: UpdateJobDto, userId: string, userRole: UserRole) {
    const job = await this.jobModel.findById(id).lean();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Only job creator or admin can update
    if (job.createdBy.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own job postings');
    }

    return this.jobModel
      .findByIdAndUpdate(id, updateJobDto, { new: true })
      .lean();
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const job = await this.jobModel.findById(id).lean();

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Only job creator or admin can delete
    if (job.createdBy.toString() !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own job postings');
    }

    await this.jobModel.findByIdAndDelete(id);
    return { message: 'Job deleted successfully' };
  }

  async search(searchJobsDto: SearchJobsDto) {
    const { 
      query, 
      location, 
      salaryMin, 
      salaryMax, 
      experienceLevel, 
      employmentType,
      page = 1,
      limit = 20 
    } = searchJobsDto;

    const skip = (page - 1) * limit;
    const filter: any = { isActive: true };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (salaryMin) {
      filter.salaryMin = { $gte: salaryMin };
    }

    if (salaryMax) {
      filter.salaryMax = { $lte: salaryMax };
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    const [jobs, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.jobModel.countDocuments(filter)
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
