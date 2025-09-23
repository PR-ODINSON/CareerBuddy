import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: any) {
    return this.prisma.job.findMany({
      where: {
        isActive: true,
        ...filters,
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  // Placeholder for AI-powered job recommendations
  async getRecommendations(userId: string) {
    // TODO: Implement AI job recommendations based on user profile and resume
    const jobs = await this.findAll();
    return {
      message: 'AI job recommendations coming soon!',
      jobs: jobs.slice(0, 5), // Return first 5 jobs as placeholder
    };
  }

  async search(query: string, filters?: any) {
    return this.prisma.job.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        ...filters,
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
