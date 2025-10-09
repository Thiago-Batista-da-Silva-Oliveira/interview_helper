import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import { INTERVIEW_REPOSITORY } from '@modules/interview/repositories/tokens';
import { Interview } from '@modules/interview/entities/Interview';

interface ICancelInterviewRequest {
  userId: string;
  interviewId: string;
}

interface ICancelInterviewResponse {
  interview: Interview;
}

@Injectable()
export class CancelInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
  ) {}

  async execute(request: ICancelInterviewRequest): Promise<ICancelInterviewResponse> {
    const { userId, interviewId } = request;

    // Validate interview exists
    const interview = await this.interviewRepository.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Validate ownership
    if (!interview.belongsTo(userId)) {
      throw new ForbiddenException('You do not have permission to access this interview');
    }

    // Cancel interview
    interview.cancel();

    await this.interviewRepository.update(interview);

    return {
      interview,
    };
  }
}
