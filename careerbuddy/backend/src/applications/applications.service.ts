import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
        resume: {
          select: {
            title: true,
          },
        },
        interviews: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        job: true,
        resume: true,
        interviews: true,
      },
    });
  }

  async apply(userId: string, jobId: string, resumeId?: string, coverLetter?: string) {
    return this.prisma.application.create({
      data: {
        userId,
        jobId,
        resumeId,
        coverLetter,
      },
      include: {
        job: true,
        resume: true,
      },
    });
  }

  async updateStatus(id: string, userId: string, status: any, notes?: string) {
    return this.prisma.application.update({
      where: { id },
      data: { status, notes },
    });
  }
}
