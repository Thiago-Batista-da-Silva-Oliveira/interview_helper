import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
} from '@modules/interview/repositories/tokens';
import { Interview } from '@modules/interview/entities/Interview';
import type { IAIProvider } from '@infra/ai/interfaces/IAIProvider';
import { IAIMessage } from '@infra/ai/interfaces/IAIProvider';
import { AI_PROVIDER } from '@infra/ai/interfaces/tokens';

interface ICompleteInterviewRequest {
  userId: string;
  interviewId: string;
}

interface ICompleteInterviewResponse {
  interview: Interview;
}

@Injectable()
export class CompleteInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessageRepository,
    @Inject(AI_PROVIDER)
    private aiProvider: IAIProvider,
  ) {}

  async execute(
    request: ICompleteInterviewRequest,
  ): Promise<ICompleteInterviewResponse> {
    const { userId, interviewId } = request;

    // Validate interview exists
    const interview = await this.interviewRepository.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Validate ownership
    if (!interview.belongsTo(userId)) {
      throw new ForbiddenException(
        'You do not have permission to access this interview',
      );
    }

    // Validate interview is in progress
    if (interview.isCompleted()) {
      throw new BadRequestException('Interview is already completed');
    }

    if (interview.isCancelled()) {
      throw new BadRequestException('Cannot complete a cancelled interview');
    }

    // Get full conversation history
    const messageHistory =
      await this.messageRepository.findByInterviewId(interviewId);

    // Build messages for feedback generation
    const aiMessages: IAIMessage[] = messageHistory.map((msg) => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Generate feedback using AI
    const feedbackResponse = await this.aiProvider.generateFeedback({
      resumeDescription: interview.resumeDescription,
      jobDescription: interview.jobDescription,
      messages: aiMessages,
    });

    // Complete interview with feedback
    interview.complete(
      feedbackResponse.feedback,
      feedbackResponse.insights,
      feedbackResponse.score,
    );

    await this.interviewRepository.update(interview);

    return {
      interview,
    };
  }
}
