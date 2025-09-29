import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma/prisma.service';
import {
  IUserSessionRepository,
  CreateUserSessionData,
  UserSession,
} from '@modules/user/repositories/IUserSessionRepository';

@Injectable()
export class PrismaUserSessionRepository implements IUserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserSessionData): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<UserSession | null> {
    return this.prisma.userSession.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deactivateAllByUserId(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }
}
