import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import type { IInterviewQuestionRepository } from '@modules/interview/repositories/IInterviewQuestionRepository';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
  INTERVIEW_QUESTION_REPOSITORY,
} from '@modules/interview/repositories/tokens';
import type { IQuestionBankRepository } from '@modules/question-bank/repositories/IQuestionBankRepository';
import { QUESTION_BANK_REPOSITORY } from '@modules/question-bank/repositories/tokens';
import { Message } from '@modules/interview/entities/Message';
import { MessageRole } from '@modules/interview/dtos/IMessageDTO';
import type { IAIProvider } from '@infra/ai/interfaces/IAIProvider';
import { IAIMessage } from '@infra/ai/interfaces/IAIProvider';
import { AI_PROVIDER } from '@infra/ai/interfaces/tokens';
import { SYSTEM_PROMPT } from '@modules/interview/prompts/system-prompt';
import { buildConversationContext } from '@modules/interview/prompts/interview-prompt';
import { buildConversationContextWithQuestions } from '@modules/interview/prompts/question-aware-prompt';

interface ISendMessageRequest {
  userId: string;
  interviewId: string;
  content: string;
}

interface ISendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

@Injectable()
export class SendMessageService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessageRepository,
    @Inject(INTERVIEW_QUESTION_REPOSITORY)
    private interviewQuestionRepository: IInterviewQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private questionBankRepository: IQuestionBankRepository,
    @Inject(AI_PROVIDER)
    private aiProvider: IAIProvider,
  ) {}

  async execute(request: ISendMessageRequest): Promise<ISendMessageResponse> {
    const { userId, interviewId, content } = request;

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
    if (!interview.isInProgress()) {
      throw new BadRequestException(
        'Interview is not in progress. Cannot send messages.',
      );
    }

    // Save user message
    const userMessage = Message.create({
      interviewId,
      role: MessageRole.USER,
      content,
      createdAt: new Date(),
    });

    await this.messageRepository.create(userMessage);

    // Get conversation history
    const messageHistory =
      await this.messageRepository.findByInterviewId(interviewId);

    // Get questions suggested from the bank for this interview
    const questionIds =
      await this.interviewQuestionRepository.findQuestionIdsByInterviewId(
        interviewId,
      );

    // Build context prompt based on whether we have questions or not
    let contextPrompt: string;

    if (questionIds.length > 0) {
      // Fetch full question details from the bank
      const questions = await Promise.all(
        questionIds.map((id) => this.questionBankRepository.findById(id)),
      );

      // Filter out null values (in case some questions were deleted)
      const validQuestions = questions.filter((q) => q !== null);

      if (validQuestions.length > 0) {
        // Use context with questions
        contextPrompt = buildConversationContextWithQuestions(
          interview.resumeDescription,
          interview.jobDescription,
          validQuestions,
          [], // TODO: Track which questions were actually asked
        );
      } else {
        // Fallback if all questions were deleted
        contextPrompt = buildConversationContext(
          interview.resumeDescription,
          interview.jobDescription,
        );
      }
    } else {
      // Fallback: No questions from bank (old interviews or AI-generated questions)
      contextPrompt = buildConversationContext(
        interview.resumeDescription,
        interview.jobDescription,
      );
    }

    // Build AI messages array
    const aiMessages: IAIMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'system',
        content: contextPrompt,
      },
    ];

    // Add conversation history
    for (const msg of messageHistory) {
      aiMessages.push({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      });
    }

    // Get AI response
    const aiResponse = await this.aiProvider.sendMessage(aiMessages);

    // Save assistant message
    const assistantMessage = Message.create({
      interviewId,
      role: MessageRole.ASSISTANT,
      content: aiResponse.content,
      metadata: aiResponse.tokens ? { tokens: aiResponse.tokens } : undefined,
      createdAt: new Date(),
    });

    await this.messageRepository.create(assistantMessage);

    return {
      userMessage,
      assistantMessage,
    };
  }
}
