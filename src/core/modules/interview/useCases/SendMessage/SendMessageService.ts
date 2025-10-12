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
        // Identify which questions were already asked by analyzing message history
        const askedQuestionIds = this.identifyAskedQuestions(
          validQuestions,
          messageHistory,
        );

        // Use context with questions
        contextPrompt = buildConversationContextWithQuestions(
          interview.resumeDescription,
          interview.jobDescription,
          validQuestions,
          askedQuestionIds,
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

  /**
   * Identifica quais perguntas do banco já foram feitas analisando o histórico de mensagens.
   * Usa matching de palavras-chave para detectar se uma pergunta foi feita pela IA.
   */
  private identifyAskedQuestions(
    questions: Array<
      Exclude<Awaited<ReturnType<IQuestionBankRepository['findById']>>, null>
    >,
    messageHistory: Message[],
  ): string[] {
    // Filtrar apenas mensagens da IA (ASSISTANT)
    const assistantMessages = messageHistory.filter(
      (msg) => msg.role === MessageRole.ASSISTANT,
    );

    if (assistantMessages.length === 0) {
      return []; // Nenhuma pergunta foi feita ainda
    }

    const askedQuestionIds: string[] = [];

    // Para cada pergunta do banco
    for (const question of questions) {
      // Verificar se a pergunta foi feita em alguma mensagem da IA
      const wasAsked = this.wasQuestionAsked(
        question.question,
        assistantMessages,
      );

      if (wasAsked) {
        askedQuestionIds.push(question.id.toString());
      }
    }

    return askedQuestionIds;
  }

  /**
   * Verifica se uma pergunta específica foi feita analisando as mensagens da IA.
   * Usa normalização de texto e matching de palavras-chave.
   */
  private wasQuestionAsked(
    questionText: string,
    assistantMessages: Message[],
  ): boolean {
    // Normalizar a pergunta: lowercase, remover pontuação extra
    const normalizedQuestion = this.normalizeText(questionText);

    // Extrair palavras-chave principais (ignorar palavras comuns)
    const keywords = this.extractKeywords(normalizedQuestion);

    // Verificar se a maioria das palavras-chave aparece em alguma mensagem
    for (const message of assistantMessages) {
      const normalizedMessage = this.normalizeText(message.content);

      // Contar quantas palavras-chave aparecem na mensagem
      const matchedKeywords = keywords.filter((keyword) =>
        normalizedMessage.includes(keyword),
      );

      // Se 70% ou mais das palavras-chave aparecem, considerar como "feita"
      const matchPercentage = matchedKeywords.length / keywords.length;

      if (matchPercentage >= 0.7 && keywords.length >= 3) {
        return true;
      }

      // Para perguntas curtas (< 3 keywords), exigir 100% de match
      if (keywords.length < 3 && matchedKeywords.length === keywords.length) {
        return true;
      }
    }

    return false;
  }

  /**
   * Normaliza texto: lowercase, remove pontuação, trim
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,;:!?()[\]{}""'']/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Múltiplos espaços -> espaço único
      .trim();
  }

  /**
   * Extrai palavras-chave principais, removendo stopwords comuns
   */
  private extractKeywords(normalizedText: string): string[] {
    // Stopwords comuns em português
    const stopwords = new Set([
      'o',
      'a',
      'os',
      'as',
      'um',
      'uma',
      'de',
      'do',
      'da',
      'dos',
      'das',
      'em',
      'no',
      'na',
      'nos',
      'nas',
      'para',
      'com',
      'por',
      'e',
      'ou',
      'que',
      'qual',
      'quais',
      'como',
      'quando',
      'onde',
      'é',
      'são',
      'ser',
      'foi',
      'eram',
      'você',
      'voce',
      'seu',
      'sua',
      'seus',
      'suas',
      'me',
      'te',
      'se',
      'lhe',
      'sobre',
    ]);

    const words = normalizedText.split(' ');

    return words.filter(
      (word) =>
        word.length > 2 && // Ignorar palavras muito curtas
        !stopwords.has(word), // Ignorar stopwords
    );
  }
}
