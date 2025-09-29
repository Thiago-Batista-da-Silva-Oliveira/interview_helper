import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import {
  IUserUsageRepository,
  CreateUserUsageData,
  UserUsage,
} from '@modules/user/repositories/IUserUsageRepository';

@Injectable()
export class PrismaUserUsageRepository implements IUserUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserUsageData): Promise<UserUsage> {
    return this.prisma.userUsage.create({
      data: {
        userId: data.userId,
        month: data.month,
        textInterviewsUsed: data.textInterviewsUsed || 0,
        audioInterviewsUsed: data.audioInterviewsUsed || 0,
      },
    });
  }

  async findByUserAndMonth(
    userId: string,
    month: string,
  ): Promise<UserUsage | null> {
    return this.prisma.userUsage.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });
  }

  async update(
    id: string,
    data: Partial<CreateUserUsageData>,
  ): Promise<UserUsage> {
    return this.prisma.userUsage.update({
      where: { id },
      data,
    });
  }

  async incrementTextInterviews(
    userId: string,
    month: string,
  ): Promise<UserUsage> {
    const existing = await this.findByUserAndMonth(userId, month);

    if (existing) {
      return this.prisma.userUsage.update({
        where: { id: existing.id },
        data: {
          textInterviewsUsed: {
            increment: 1,
          },
        },
      });
    }

    return this.create({
      userId,
      month,
      textInterviewsUsed: 1,
    });
  }

  async incrementAudioInterviews(
    userId: string,
    month: string,
  ): Promise<UserUsage> {
    const existing = await this.findByUserAndMonth(userId, month);

    if (existing) {
      return this.prisma.userUsage.update({
        where: { id: existing.id },
        data: {
          audioInterviewsUsed: {
            increment: 1,
          },
        },
      });
    }

    return this.create({
      userId,
      month,
      audioInterviewsUsed: 1,
    });
  }
}
