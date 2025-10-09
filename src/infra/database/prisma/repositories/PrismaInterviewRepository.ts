import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  IInterviewRepository,
  IListInterviewsFilters,
  IListInterviewsResult,
} from '@core/modules/interview/repositories/IInterviewRepository';
import { Interview } from '@core/modules/interview/entities/Interview';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import {
  InterviewStatus,
  InterviewType,
} from '@core/modules/interview/dtos/IInterviewDTO';

@Injectable()
export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(private prisma: PrismaService) {}

  async create(interview: Interview): Promise<void> {
    await this.prisma.interview.create({
      data: {
        id: interview.id.toString(),
        userId: interview.userId,
        type: interview.type,
        status: interview.status,
        resumeDescription: interview.resumeDescription,
        jobDescription: interview.jobDescription,
        feedback: interview.feedback,
        insights: interview.insights,
        score: interview.score,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Interview | null> {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      return null;
    }

    return Interview.create(
      {
        userId: interview.userId,
        type: interview.type as InterviewType,
        status: interview.status as InterviewStatus,
        resumeDescription: interview.resumeDescription,
        jobDescription: interview.jobDescription,
        feedback: interview.feedback,
        insights: interview.insights,
        score: interview.score,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      },
      new UniqueId(interview.id),
    );
  }

  async findByUserId(
    userId: string,
    filters?: IListInterviewsFilters,
  ): Promise<IListInterviewsResult> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    const interviewEntities = interviews.map((interview) =>
      Interview.create(
        {
          userId: interview.userId,
          type: interview.type as InterviewType,
          status: interview.status as InterviewStatus,
          resumeDescription: interview.resumeDescription,
          jobDescription: interview.jobDescription,
          feedback: interview.feedback,
          insights: interview.insights,
          score: interview.score,
          startedAt: interview.startedAt,
          completedAt: interview.completedAt,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        },
        new UniqueId(interview.id),
      ),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      interviews: interviewEntities,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(interview: Interview): Promise<void> {
    await this.prisma.interview.update({
      where: { id: interview.id.toString() },
      data: {
        status: interview.status,
        feedback: interview.feedback,
        insights: interview.insights,
        score: interview.score,
        startedAt: interview.startedAt,
        completedAt: interview.completedAt,
        updatedAt: interview.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.interview.delete({
      where: { id },
    });
  }
}
