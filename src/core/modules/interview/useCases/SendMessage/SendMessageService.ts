import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import { INTERVIEW_REPOSITORY, MESSAGE_REPOSITORY } from '@modules/interview/repositories/tokens';
import { Message } from '@modules/interview/entities/Message';
import { MessageRole } from '@modules/interview/dtos/IMessageDTO';
import type { IAIProvider } from '@infra/ai/interfaces/IAIProvider';
import { IAIMessage } from '@infra/ai/interfaces/IAIProvider';
import { AI_PROVIDER } from '@infra/ai/interfaces/tokens';
import { SYSTEM_PROMPT } from '@modules/interview/prompts/system-prompt';
import { buildConversationContext } from '@modules/interview/prompts/interview-prompt';

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
      throw new ForbiddenException('You do not have permission to access this interview');
    }

    // Validate interview is in progress
    if (!interview.isInProgress()) {
      throw new BadRequestException('Interview is not in progress. Cannot send messages.');
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
    const messageHistory = await this.messageRepository.findByInterviewId(interviewId);

    // Build AI messages array
    const aiMessages: IAIMessage[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'system',
        content: buildConversationContext(
          interview.resumeDescription,
          interview.jobDescription,
        ),
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
