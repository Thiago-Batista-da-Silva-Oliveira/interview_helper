import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IInterviewRepository } from '@modules/interview/repositories/IInterviewRepository';
import type { IMessageRepository } from '@modules/interview/repositories/IMessageRepository';
import type { IInterviewQuestionRepository } from '@modules/interview/repositories/IInterviewQuestionRepository';
import { MessageRole } from '@modules/interview/dtos/IMessageDTO';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
  INTERVIEW_QUESTION_REPOSITORY,
} from '@modules/interview/repositories/tokens';
import type { IInterviewAnalyticsRepository } from '@modules/analytics/repositories/IInterviewAnalyticsRepository';
import { INTERVIEW_ANALYTICS_REPOSITORY } from '@modules/analytics/repositories/tokens';
import { InterviewAnalytics } from '@modules/analytics/entities/InterviewAnalytics';
import { CategoryScore } from '@modules/analytics/entities/CategoryScore';
import { DifficultyScore } from '@modules/analytics/entities/DifficultyScore';
import {
  QuestionCategory,
  QuestionDifficulty,
} from '@modules/question-bank/dtos/IQuestionBankDTO';

interface IAnalyzeInterviewRequest {
  interviewId: string;
}

interface IAnalyzeInterviewResponse {
  analytics: InterviewAnalytics;
}

@Injectable()
export class AnalyzeInterviewService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
    @Inject(MESSAGE_REPOSITORY)
    private messageRepository: IMessageRepository,
    @Inject(INTERVIEW_QUESTION_REPOSITORY)
    private interviewQuestionRepository: IInterviewQuestionRepository,
    @Inject(INTERVIEW_ANALYTICS_REPOSITORY)
    private analyticsRepository: IInterviewAnalyticsRepository,
  ) {}

  async execute(
    request: IAnalyzeInterviewRequest,
  ): Promise<IAnalyzeInterviewResponse> {
    const { interviewId } = request;

    // Validate interview exists and is completed
    const interview = await this.interviewRepository.findById(interviewId);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (!interview.isCompleted()) {
      throw new BadRequestException(
        'Interview must be completed before analysis',
      );
    }

    // Check if analytics already exists
    const existingAnalytics =
      await this.analyticsRepository.findByInterviewId(interviewId);
    if (existingAnalytics) {
      return { analytics: existingAnalytics };
    }

    // Get interview questions with their metadata
    const interviewQuestions =
      await this.interviewQuestionRepository.findByInterviewId(interviewId);

    // Get conversation history
    const messages =
      await this.messageRepository.findByInterviewId(interviewId);

    // Calculate temporal metrics
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.role === MessageRole.USER);
    const totalDuration = this.calculateDuration(messages);
    const avgResponseTime = this.calculateAvgResponseTime(messages);

    // Calculate scores by category
    const categoryScoresMap = new Map<
      QuestionCategory,
      { total: number; count: number; correct: number }
    >();

    interviewQuestions.forEach((iq) => {
      const category = iq.question.category as QuestionCategory;
      if (!categoryScoresMap.has(category)) {
        categoryScoresMap.set(category, { total: 0, count: 0, correct: 0 });
      }

      const stats = categoryScoresMap.get(category)!;
      stats.count++;
      // Por enquanto, vamos usar o score geral da entrevista
      // Futuramente, podemos adicionar análise individual por pergunta
      stats.total += interview.score || 0;
      stats.correct += interview.score && interview.score >= 70 ? 1 : 0;
    });

    // Calculate scores by difficulty
    const difficultyScoresMap = new Map<
      QuestionDifficulty,
      { total: number; count: number }
    >();

    interviewQuestions.forEach((iq) => {
      const difficulty = iq.question.difficulty as QuestionDifficulty;
      if (!difficultyScoresMap.has(difficulty)) {
        difficultyScoresMap.set(difficulty, { total: 0, count: 0 });
      }

      const stats = difficultyScoresMap.get(difficulty)!;
      stats.count++;
      stats.total += interview.score || 0;
    });

    // Create analytics entity
    const analytics = InterviewAnalytics.create({
      interviewId,
      overallScore: interview.score || 0,
      communicationQuality: this.estimateCommunicationQuality(userMessages),
      depthOfKnowledge: this.estimateDepthOfKnowledge(userMessages),
      clarityScore: this.estimateClarityScore(userMessages),
      avgResponseTime,
      totalDuration,
      totalMessages,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save analytics
    await this.analyticsRepository.create(analytics);

    // Save category scores
    const categoryScores: CategoryScore[] = [];
    for (const [category, stats] of categoryScoresMap.entries()) {
      const avgScore =
        stats.count > 0 ? Math.round(stats.total / stats.count) : 0;
      const categoryScore = CategoryScore.create({
        analyticsId: analytics.id.toString(),
        category,
        score: avgScore,
        questionsAnswered: stats.count,
        questionsCorrect: stats.correct,
      });

      await this.analyticsRepository.createCategoryScore(categoryScore);
      categoryScores.push(categoryScore);
    }

    // Save difficulty scores
    const difficultyScores: DifficultyScore[] = [];
    for (const [difficulty, stats] of difficultyScoresMap.entries()) {
      const avgScore =
        stats.count > 0 ? Math.round(stats.total / stats.count) : 0;
      const difficultyScore = DifficultyScore.create({
        analyticsId: analytics.id.toString(),
        difficulty,
        score: avgScore,
        questionsAnswered: stats.count,
      });

      await this.analyticsRepository.createDifficultyScore(difficultyScore);
      difficultyScores.push(difficultyScore);
    }

    // Reload analytics with scores
    const completeAnalytics = await this.analyticsRepository.findById(
      analytics.id.toString(),
    );

    return {
      analytics: completeAnalytics!,
    };
  }

  private calculateDuration(messages: any[]): number | null {
    if (messages.length === 0) return null;

    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    const durationMs =
      lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime();
    return Math.round(durationMs / 1000 / 60); // Convert to minutes
  }

  private calculateAvgResponseTime(messages: any[]): number | null {
    const userMessages = messages.filter((m) => m.role === MessageRole.USER);
    if (userMessages.length <= 1) return null;

    let totalTime = 0;
    for (let i = 1; i < userMessages.length; i++) {
      const timeDiff =
        userMessages[i].createdAt.getTime() -
        userMessages[i - 1].createdAt.getTime();
      totalTime += timeDiff;
    }

    return Math.round(totalTime / (userMessages.length - 1) / 1000); // Convert to seconds
  }

  // Estimativa simples baseada no tamanho das respostas
  // Futuramente, podemos usar IA para análise mais sofisticada
  private estimateCommunicationQuality(userMessages: any[]): number {
    if (userMessages.length === 0) return 50;

    const avgLength =
      userMessages.reduce((sum, msg) => sum + msg.content.length, 0) /
      userMessages.length;

    // Respostas muito curtas (<50 chars) ou muito longas (>1000 chars) são penalizadas
    if (avgLength < 50) return 40;
    if (avgLength > 1000) return 60;
    if (avgLength >= 100 && avgLength <= 500) return 80;
    return 70;
  }

  private estimateDepthOfKnowledge(userMessages: any[]): number {
    if (userMessages.length === 0) return 50;

    // Conta palavras técnicas comuns (simplificado)
    const technicalWords = [
      'arquitetura',
      'performance',
      'otimização',
      'escalabilidade',
      'refatoração',
      'design pattern',
      'solid',
      'microservices',
      'api',
      'database',
      'cache',
      'docker',
      'kubernetes',
      'ci/cd',
    ];

    let technicalWordCount = 0;
    userMessages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      technicalWords.forEach((word) => {
        if (content.includes(word)) technicalWordCount++;
      });
    });

    const avgTechnicalWords = technicalWordCount / userMessages.length;
    if (avgTechnicalWords >= 3) return 90;
    if (avgTechnicalWords >= 2) return 75;
    if (avgTechnicalWords >= 1) return 60;
    return 50;
  }

  private estimateClarityScore(userMessages: any[]): number {
    if (userMessages.length === 0) return 50;

    // Mede clareza baseado em pontuação e estrutura
    let wellStructured = 0;
    userMessages.forEach((msg) => {
      const content = msg.content;
      // Checa se tem pontuação adequada
      const hasPunctuation = /[.!?]/.test(content);
      // Checa se não é apenas uma palavra
      const hasMultipleWords = content.split(/\s+/).length > 3;
      if (hasPunctuation && hasMultipleWords) wellStructured++;
    });

    const clarity = (wellStructured / userMessages.length) * 100;
    return Math.round(clarity);
  }
}
