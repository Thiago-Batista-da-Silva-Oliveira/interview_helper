import { Injectable, Inject } from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
} from '@modules/interview/repositories/tokens';
import { Interview } from '@modules/interview/entities/Interview';
import { Message } from '@modules/interview/entities/Message';
import {
  InterviewStatus,
  InterviewType,
} from '@modules/interview/dtos/IInterviewDTO';
import { MessageRole } from '@modules/interview/dtos/IMessageDTO';
import type { IAIProvider } from '@infra/ai/interfaces/IAIProvider';
import { AI_PROVIDER } from '@infra/ai/interfaces/tokens';
import { CheckUserUsageService } from '@modules/user/useCases/CheckUserUsage/CheckUserUsageService';
import { IncrementUserUsageService } from '@modules/user/useCases/IncrementUserUsage/IncrementUserUsageService';
import { SYSTEM_PROMPT } from '@modules/interview/prompts/system-prompt';
import { buildInterviewStartPrompt } from '@modules/interview/prompts/interview-prompt';
import { buildInterviewStartPromptWithQuestions } from '@modules/interview/prompts/question-aware-prompt';
import { SelectQuestionsService } from '@modules/question-bank/useCases/SelectQuestions/SelectQuestionsService';
import { RecordInterviewQuestionService } from '@modules/interview/useCases/RecordInterviewQuestion/RecordInterviewQuestionService';

interface IStartInterviewRequest {
  userId: string;
  resumeDescription: string;
  jobDescription: string;
  type: InterviewType;
}

interface IStartInterviewResponse {
  interview: Interview;
  firstMessage: Message;
}

@Injectable()
export class StartInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessageRepository,
    @Inject(AI_PROVIDER)
    private aiProvider: IAIProvider,
    private checkUserUsageService: CheckUserUsageService,
    private incrementUserUsageService: IncrementUserUsageService,
    private selectQuestionsService: SelectQuestionsService,
    private recordInterviewQuestionService: RecordInterviewQuestionService,
  ) {}

  async execute(
    request: IStartInterviewRequest,
  ): Promise<IStartInterviewResponse> {
    const { userId, resumeDescription, jobDescription, type } = request;

    // Validate user has credits
    await this.checkUserUsageService.execute({
      userId,
      interviewType: type,
    });

    // Create interview
    const interview = Interview.create({
      userId,
      type,
      status: InterviewStatus.PENDING,
      resumeDescription,
      jobDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.interviewRepository.create(interview);

    // Start interview
    interview.start();
    await this.interviewRepository.update(interview);

    // 1. Select questions from the question bank
    const selectedQuestionsResult = await this.selectQuestionsService.execute({
      resumeDescription,
      jobDescription,
      maxQuestions: 5,
    });

    // 2. Build appropriate prompt (with questions or fallback)
    let startPrompt: string;

    if (selectedQuestionsResult.questions.length > 0) {
      // Use questions from the bank
      startPrompt = buildInterviewStartPromptWithQuestions(
        resumeDescription,
        jobDescription,
        selectedQuestionsResult.questions,
      );
    } else {
      // Fallback: no questions found in bank, AI creates its own
      startPrompt = buildInterviewStartPrompt(
        resumeDescription,
        jobDescription,
      );
    }

    // 3. Generate first message from AI
    const aiResponse = await this.aiProvider.sendMessage([
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: startPrompt,
      },
    ]);

    // 4. Save first message
    const firstMessage = Message.create({
      interviewId: interview.id.toString(),
      role: MessageRole.ASSISTANT,
      content: aiResponse.content,
      createdAt: new Date(),
    });

    await this.messageRepository.create(firstMessage);

    // 5. Record questions used in this interview
    if (selectedQuestionsResult.questions.length > 0) {
      await this.recordInterviewQuestionService.execute({
        interviewId: interview.id.toString(),
        questionIds: selectedQuestionsResult.questions.map((q) =>
          q.id.toString(),
        ),
      });
    }

    // Increment usage
    await this.incrementUserUsageService.execute({
      userId,
      interviewType: type,
    });

    return {
      interview,
      firstMessage,
    };
  }
}
