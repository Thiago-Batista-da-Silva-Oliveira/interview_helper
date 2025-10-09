import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import { INTERVIEW_REPOSITORY, MESSAGE_REPOSITORY } from '@modules/interview/repositories/tokens';
import { Interview } from '@modules/interview/entities/Interview';
import { Message } from '@modules/interview/entities/Message';

interface IGetInterviewHistoryRequest {
  userId: string;
  interviewId: string;
}

interface IGetInterviewHistoryResponse {
  interview: Interview;
  messages: Message[];
}

@Injectable()
export class GetInterviewHistoryService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessageRepository,
  ) {}

  async execute(request: IGetInterviewHistoryRequest): Promise<IGetInterviewHistoryResponse> {
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

    // Get all messages
    const messages = await this.messageRepository.findByInterviewId(interviewId);

    return {
      interview,
      messages,
    };
  }
}
