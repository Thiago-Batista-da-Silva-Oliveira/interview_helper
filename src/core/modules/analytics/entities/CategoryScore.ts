import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import {
  QuestionCategory,
  ICategoryScoreDTO,
} from '../dtos/IInterviewAnalyticsDTO';

export interface ICategoryScoreProps {
  analyticsId: string;
  category: QuestionCategory;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
}

export class CategoryScore extends Entity<ICategoryScoreProps> {
  get analyticsId(): string {
    return this.props.analyticsId;
  }

  get category(): QuestionCategory {
    return this.props.category;
  }

  get score(): number {
    return this.props.score;
  }

  get questionsAnswered(): number {
    return this.props.questionsAnswered;
  }

  get questionsCorrect(): number {
    return this.props.questionsCorrect;
  }

  public toDTO(): ICategoryScoreDTO {
    return {
      id: this.id.toString(),
      analyticsId: this.analyticsId,
      category: this.category,
      score: this.score,
      questionsAnswered: this.questionsAnswered,
      questionsCorrect: this.questionsCorrect,
    };
  }

  public static create(
    props: ICategoryScoreProps,
    id?: UniqueId,
  ): CategoryScore {
    // Validações
    if (props.score < 0 || props.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
    if (props.questionsAnswered < 0) {
      throw new Error('Questions answered must be non-negative');
    }
    if (props.questionsCorrect < 0) {
      throw new Error('Questions correct must be non-negative');
    }
    if (props.questionsCorrect > props.questionsAnswered) {
      throw new Error(
        'Questions correct cannot be greater than questions answered',
      );
    }

    return new CategoryScore(props, id);
  }
}
