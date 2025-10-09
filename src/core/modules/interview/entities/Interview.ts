import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import {
  InterviewStatus,
  InterviewType,
  IInterviewDTO,
} from '../dtos/IInterviewDTO';

export interface IInterviewProps {
  userId: string;
  type: InterviewType;
  status: InterviewStatus;
  resumeDescription: string;
  jobDescription: string;
  feedback?: string | null;
  insights?: string | null;
  score?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Interview extends Entity<IInterviewProps> {
  get userId(): string {
    return this.props.userId;
  }

  get type(): InterviewType {
    return this.props.type;
  }

  get status(): InterviewStatus {
    return this.props.status;
  }

  get resumeDescription(): string {
    return this.props.resumeDescription;
  }

  get jobDescription(): string {
    return this.props.jobDescription;
  }

  get feedback(): string | null | undefined {
    return this.props.feedback;
  }

  get insights(): string | null | undefined {
    return this.props.insights;
  }

  get score(): number | null | undefined {
    return this.props.score;
  }

  get startedAt(): Date | null | undefined {
    return this.props.startedAt;
  }

  get completedAt(): Date | null | undefined {
    return this.props.completedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public start(): void {
    if (this.props.status !== InterviewStatus.PENDING) {
      throw new Error('Interview can only be started if status is PENDING');
    }
    this.props.status = InterviewStatus.IN_PROGRESS;
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public complete(feedback: string, insights: string, score: number): void {
    if (this.props.status !== InterviewStatus.IN_PROGRESS) {
      throw new Error(
        'Interview can only be completed if status is IN_PROGRESS',
      );
    }
    if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
    this.props.status = InterviewStatus.COMPLETED;
    this.props.feedback = feedback;
    this.props.insights = insights;
    this.props.score = score;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status === InterviewStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed interview');
    }
    this.props.status = InterviewStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  public isInProgress(): boolean {
    return this.props.status === InterviewStatus.IN_PROGRESS;
  }

  public isCompleted(): boolean {
    return this.props.status === InterviewStatus.COMPLETED;
  }

  public isCancelled(): boolean {
    return this.props.status === InterviewStatus.CANCELLED;
  }

  public belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }

  public toDTO(): IInterviewDTO {
    return {
      id: this.id.toString(),
      userId: this.userId,
      type: this.type,
      status: this.status,
      resumeDescription: this.resumeDescription,
      jobDescription: this.jobDescription,
      feedback: this.feedback,
      insights: this.insights,
      score: this.score,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static create(props: IInterviewProps, id?: UniqueId): Interview {
    const interview = new Interview(props, id);
    return interview;
  }
}
