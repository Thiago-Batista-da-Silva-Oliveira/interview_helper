import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IInterviewAnalyticsRepository } from '@core/modules/analytics/repositories/IInterviewAnalyticsRepository';
import { InterviewAnalytics } from '@core/modules/analytics/entities/InterviewAnalytics';
import { CategoryScore } from '@core/modules/analytics/entities/CategoryScore';
import { DifficultyScore } from '@core/modules/analytics/entities/DifficultyScore';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import {
  QuestionCategory,
  QuestionDifficulty,
} from '@modules/question-bank/dtos/IQuestionBankDTO';

@Injectable()
export class PrismaInterviewAnalyticsRepository
  implements IInterviewAnalyticsRepository
{
  constructor(private prisma: PrismaService) {}

  async create(analytics: InterviewAnalytics): Promise<void> {
    await this.prisma.interviewAnalytics.create({
      data: {
        id: analytics.id.toString(),
        interviewId: analytics.interviewId,
        overallScore: analytics.overallScore,
        communicationQuality: analytics.communicationQuality,
        depthOfKnowledge: analytics.depthOfKnowledge,
        clarityScore: analytics.clarityScore,
        avgResponseTime: analytics.avgResponseTime,
        totalDuration: analytics.totalDuration,
        totalMessages: analytics.totalMessages,
        metadata: analytics.metadata,
        createdAt: analytics.createdAt,
        updatedAt: analytics.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<InterviewAnalytics | null> {
    const analytics = await this.prisma.interviewAnalytics.findUnique({
      where: { id },
      include: {
        categoryScores: true,
        difficultyScores: true,
      },
    });

    if (!analytics) {
      return null;
    }

    return this.toDomain(analytics);
  }

  async findByInterviewId(
    interviewId: string,
  ): Promise<InterviewAnalytics | null> {
    const analytics = await this.prisma.interviewAnalytics.findUnique({
      where: { interviewId },
      include: {
        categoryScores: true,
        difficultyScores: true,
      },
    });

    if (!analytics) {
      return null;
    }

    return this.toDomain(analytics);
  }

  async update(analytics: InterviewAnalytics): Promise<void> {
    await this.prisma.interviewAnalytics.update({
      where: { id: analytics.id.toString() },
      data: {
        overallScore: analytics.overallScore,
        communicationQuality: analytics.communicationQuality,
        depthOfKnowledge: analytics.depthOfKnowledge,
        clarityScore: analytics.clarityScore,
        avgResponseTime: analytics.avgResponseTime,
        totalDuration: analytics.totalDuration,
        totalMessages: analytics.totalMessages,
        metadata: analytics.metadata,
        updatedAt: analytics.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.interviewAnalytics.delete({
      where: { id },
    });
  }

  // Category scores
  async createCategoryScore(categoryScore: CategoryScore): Promise<void> {
    await this.prisma.categoryScore.create({
      data: {
        id: categoryScore.id.toString(),
        analyticsId: categoryScore.analyticsId,
        category: categoryScore.category,
        score: categoryScore.score,
        questionsAnswered: categoryScore.questionsAnswered,
        questionsCorrect: categoryScore.questionsCorrect,
      },
    });
  }

  async findCategoryScoresByAnalyticsId(
    analyticsId: string,
  ): Promise<CategoryScore[]> {
    const scores = await this.prisma.categoryScore.findMany({
      where: { analyticsId },
    });

    return scores.map((score) =>
      CategoryScore.create(
        {
          analyticsId: score.analyticsId,
          category: score.category as QuestionCategory,
          score: score.score,
          questionsAnswered: score.questionsAnswered,
          questionsCorrect: score.questionsCorrect,
        },
        new UniqueId(score.id),
      ),
    );
  }

  // Difficulty scores
  async createDifficultyScore(difficultyScore: DifficultyScore): Promise<void> {
    await this.prisma.difficultyScore.create({
      data: {
        id: difficultyScore.id.toString(),
        analyticsId: difficultyScore.analyticsId,
        difficulty: difficultyScore.difficulty,
        score: difficultyScore.score,
        questionsAnswered: difficultyScore.questionsAnswered,
      },
    });
  }

  async findDifficultyScoresByAnalyticsId(
    analyticsId: string,
  ): Promise<DifficultyScore[]> {
    const scores = await this.prisma.difficultyScore.findMany({
      where: { analyticsId },
    });

    return scores.map((score) =>
      DifficultyScore.create(
        {
          analyticsId: score.analyticsId,
          difficulty: score.difficulty as QuestionDifficulty,
          score: score.score,
          questionsAnswered: score.questionsAnswered,
        },
        new UniqueId(score.id),
      ),
    );
  }

  // Helper method to convert Prisma model to domain entity
  private toDomain(prismaAnalytics: any): InterviewAnalytics {
    const categoryScores = prismaAnalytics.categoryScores?.map((score: any) =>
      CategoryScore.create(
        {
          analyticsId: score.analyticsId,
          category: score.category as QuestionCategory,
          score: score.score,
          questionsAnswered: score.questionsAnswered,
          questionsCorrect: score.questionsCorrect,
        },
        new UniqueId(score.id),
      ),
    );

    const difficultyScores = prismaAnalytics.difficultyScores?.map(
      (score: any) =>
        DifficultyScore.create(
          {
            analyticsId: score.analyticsId,
            difficulty: score.difficulty as QuestionDifficulty,
            score: score.score,
            questionsAnswered: score.questionsAnswered,
          },
          new UniqueId(score.id),
        ),
    );

    return InterviewAnalytics.create(
      {
        interviewId: prismaAnalytics.interviewId,
        overallScore: prismaAnalytics.overallScore,
        communicationQuality: prismaAnalytics.communicationQuality,
        depthOfKnowledge: prismaAnalytics.depthOfKnowledge,
        clarityScore: prismaAnalytics.clarityScore,
        avgResponseTime: prismaAnalytics.avgResponseTime,
        totalDuration: prismaAnalytics.totalDuration,
        totalMessages: prismaAnalytics.totalMessages,
        metadata: prismaAnalytics.metadata,
        createdAt: prismaAnalytics.createdAt,
        updatedAt: prismaAnalytics.updatedAt,
        categoryScores,
        difficultyScores,
      },
      new UniqueId(prismaAnalytics.id),
    );
  }
}
