import { Injectable, Inject } from '@nestjs/common';
import type { IUserUsageRepository } from '@modules/user/repositories/IUserUsageRepository';
import { USER_USAGE_REPOSITORY_TOKEN } from '@modules/user/repositories/tokens';
import { InterviewType } from '@modules/interview/dtos/IInterviewDTO';

interface IIncrementUserUsageRequest {
  userId: string;
  interviewType: InterviewType;
}

@Injectable()
export class IncrementUserUsageService {
  constructor(
    @Inject(USER_USAGE_REPOSITORY_TOKEN)
    private userUsageRepository: IUserUsageRepository,
  ) {}

  async execute(request: IIncrementUserUsageRequest): Promise<void> {
    const { userId, interviewType } = request;

    const currentMonth = this.getCurrentMonth();

    // Check if usage record exists for current month
    const usage = await this.userUsageRepository.findByUserAndMonth(
      userId,
      currentMonth,
    );

    if (!usage) {
      // Create new usage record for the month
      await this.userUsageRepository.create({
        userId,
        month: currentMonth,
        textInterviewsUsed: interviewType === InterviewType.TEXT ? 1 : 0,
        audioInterviewsUsed: interviewType === InterviewType.AUDIO ? 1 : 0,
      });
    } else {
      // Increment the appropriate counter
      if (interviewType === InterviewType.TEXT) {
        await this.userUsageRepository.incrementTextInterviews(
          userId,
          currentMonth,
        );
      } else {
        await this.userUsageRepository.incrementAudioInterviews(
          userId,
          currentMonth,
        );
      }
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
