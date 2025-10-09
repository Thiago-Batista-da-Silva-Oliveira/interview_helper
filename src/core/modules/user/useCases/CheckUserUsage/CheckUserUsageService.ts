import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IUserUsageRepository } from '@modules/user/repositories/IUserUsageRepository';
import type { IUserRepository } from '@modules/user/repositories/IUserRepository';
import {
  USER_USAGE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '@modules/user/repositories/tokens';
import { InterviewType } from '@modules/interview/dtos/IInterviewDTO';

interface ICheckUserUsageRequest {
  userId: string;
  interviewType: InterviewType;
}

@Injectable()
export class CheckUserUsageService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private userRepository: IUserRepository,
    @Inject(USER_USAGE_REPOSITORY_TOKEN)
    private userUsageRepository: IUserUsageRepository,
  ) {}

  async execute(request: ICheckUserUsageRequest): Promise<void> {
    const { userId, interviewType } = request;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentMonth = this.getCurrentMonth();
    const usage = await this.userUsageRepository.findByUserAndMonth(
      userId,
      currentMonth,
    );

    const limits = this.getPlanLimits(user.plan);
    const currentUsage = this.getCurrentUsage(usage, interviewType);

    if (currentUsage >= limits[interviewType]) {
      throw new ForbiddenException(
        `Você atingiu o limite de entrevistas ${interviewType === InterviewType.TEXT ? 'por texto' : 'por áudio'} do seu plano. Upgrade para PREMIUM para mais entrevistas.`,
      );
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private getPlanLimits(plan: string): Record<InterviewType, number> {
    return {
      [InterviewType.TEXT]: plan === 'PREMIUM' ? 20 : 1,
      [InterviewType.AUDIO]: plan === 'PREMIUM' ? 20 : 1,
    };
  }

  private getCurrentUsage(
    usage: any | null,
    interviewType: InterviewType,
  ): number {
    if (!usage) {
      return 0;
    }

    return interviewType === InterviewType.TEXT
      ? usage.textInterviewsUsed
      : usage.audioInterviewsUsed;
  }
}
