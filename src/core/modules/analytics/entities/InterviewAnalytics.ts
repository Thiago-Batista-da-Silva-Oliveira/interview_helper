import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import { IInterviewAnalyticsDTO } from '../dtos/IInterviewAnalyticsDTO';
import { CategoryScore } from './CategoryScore';
import { DifficultyScore } from './DifficultyScore';

export interface IInterviewAnalyticsProps {
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
  categoryScores?: CategoryScore[];
  difficultyScores?: DifficultyScore[];
}

export class InterviewAnalytics extends Entity<IInterviewAnalyticsProps> {
  get interviewId(): string {
    return this.props.interviewId;
  }

  get overallScore(): number {
    return this.props.overallScore;
  }

  get communicationQuality(): number | null | undefined {
    return this.props.communicationQuality;
  }

  get depthOfKnowledge(): number | null | undefined {
    return this.props.depthOfKnowledge;
  }

  get clarityScore(): number | null | undefined {
    return this.props.clarityScore;
  }

  get avgResponseTime(): number | null | undefined {
    return this.props.avgResponseTime;
  }

  get totalDuration(): number | null | undefined {
    return this.props.totalDuration;
  }

  get totalMessages(): number {
    return this.props.totalMessages;
  }

  get metadata(): string | null | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get categoryScores(): CategoryScore[] | undefined {
    return this.props.categoryScores;
  }

  get difficultyScores(): DifficultyScore[] | undefined {
    return this.props.difficultyScores;
  }

  public toDTO(): IInterviewAnalyticsDTO {
    return {
      id: this.id.toString(),
      interviewId: this.interviewId,
      overallScore: this.overallScore,
      communicationQuality: this.communicationQuality,
      depthOfKnowledge: this.depthOfKnowledge,
      clarityScore: this.clarityScore,
      avgResponseTime: this.avgResponseTime,
      totalDuration: this.totalDuration,
      totalMessages: this.totalMessages,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      categoryScores: this.categoryScores?.map((cs) => cs.toDTO()),
      difficultyScores: this.difficultyScores?.map((ds) => ds.toDTO()),
    };
  }

  public static create(
    props: IInterviewAnalyticsProps,
    id?: UniqueId,
  ): InterviewAnalytics {
    // Validações
    if (props.overallScore < 0 || props.overallScore > 100) {
      throw new Error('Overall score must be between 0 and 100');
    }

    if (
      props.communicationQuality !== null &&
      props.communicationQuality !== undefined &&
      (props.communicationQuality < 0 || props.communicationQuality > 100)
    ) {
      throw new Error('Communication quality must be between 0 and 100');
    }

    if (
      props.depthOfKnowledge !== null &&
      props.depthOfKnowledge !== undefined &&
      (props.depthOfKnowledge < 0 || props.depthOfKnowledge > 100)
    ) {
      throw new Error('Depth of knowledge must be between 0 and 100');
    }

    if (
      props.clarityScore !== null &&
      props.clarityScore !== undefined &&
      (props.clarityScore < 0 || props.clarityScore > 100)
    ) {
      throw new Error('Clarity score must be between 0 and 100');
    }

    if (
      props.avgResponseTime !== null &&
      props.avgResponseTime !== undefined &&
      props.avgResponseTime < 0
    ) {
      throw new Error('Average response time must be non-negative');
    }

    if (
      props.totalDuration !== null &&
      props.totalDuration !== undefined &&
      props.totalDuration < 0
    ) {
      throw new Error('Total duration must be non-negative');
    }

    if (props.totalMessages < 0) {
      throw new Error('Total messages must be non-negative');
    }

    return new InterviewAnalytics(props, id);
  }
}
