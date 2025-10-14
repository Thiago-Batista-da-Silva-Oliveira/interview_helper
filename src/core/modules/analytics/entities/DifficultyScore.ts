import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import {
  QuestionDifficulty,
  IDifficultyScoreDTO,
} from '../dtos/IInterviewAnalyticsDTO';

export interface IDifficultyScoreProps {
  analyticsId: string;
  difficulty: QuestionDifficulty;
  score: number;
  questionsAnswered: number;
}

export class DifficultyScore extends Entity<IDifficultyScoreProps> {
  get analyticsId(): string {
    return this.props.analyticsId;
  }

  get difficulty(): QuestionDifficulty {
    return this.props.difficulty;
  }

  get score(): number {
    return this.props.score;
  }

  get questionsAnswered(): number {
    return this.props.questionsAnswered;
  }

  public toDTO(): IDifficultyScoreDTO {
    return {
      id: this.id.toString(),
      analyticsId: this.analyticsId,
      difficulty: this.difficulty,
      score: this.score,
      questionsAnswered: this.questionsAnswered,
    };
  }

  public static create(
    props: IDifficultyScoreProps,
    id?: UniqueId,
  ): DifficultyScore {
    // Validações
    if (props.score < 0 || props.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
    if (props.questionsAnswered < 0) {
      throw new Error('Questions answered must be non-negative');
    }

    return new DifficultyScore(props, id);
  }
}
