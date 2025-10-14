import {
  QuestionCategory,
  QuestionDifficulty,
} from '@modules/question-bank/dtos/IQuestionBankDTO';

// Re-export para facilitar imports
export { QuestionCategory, QuestionDifficulty };

export interface ICategoryScoreDTO {
  id: string;
  analyticsId: string;
  category: QuestionCategory;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
}

export interface IDifficultyScoreDTO {
  id: string;
  analyticsId: string;
  difficulty: QuestionDifficulty;
  score: number;
  questionsAnswered: number;
}

export interface IInterviewAnalyticsDTO {
  id: string;
  interviewId: string;
  overallScore: number;
  communicationQuality?: number | null;
  depthOfKnowledge?: number | null;
  clarityScore?: number | null;
  avgResponseTime?: number | null;
  totalDuration?: number | null;
  totalMessages: number;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryScores?: ICategoryScoreDTO[];
  difficultyScores?: IDifficultyScoreDTO[];
}
