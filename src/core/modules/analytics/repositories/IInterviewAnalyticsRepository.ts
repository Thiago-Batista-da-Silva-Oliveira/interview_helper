import { InterviewAnalytics } from '../entities/InterviewAnalytics';
import { CategoryScore } from '../entities/CategoryScore';
import { DifficultyScore } from '../entities/DifficultyScore';

export interface IInterviewAnalyticsRepository {
  create(analytics: InterviewAnalytics): Promise<void>;
  findById(id: string): Promise<InterviewAnalytics | null>;
  findByInterviewId(interviewId: string): Promise<InterviewAnalytics | null>;
  update(analytics: InterviewAnalytics): Promise<void>;
  delete(id: string): Promise<void>;

  // Category scores
  createCategoryScore(categoryScore: CategoryScore): Promise<void>;
  findCategoryScoresByAnalyticsId(
    analyticsId: string,
  ): Promise<CategoryScore[]>;

  // Difficulty scores
  createDifficultyScore(difficultyScore: DifficultyScore): Promise<void>;
  findDifficultyScoresByAnalyticsId(
    analyticsId: string,
  ): Promise<DifficultyScore[]>;
}
