import { Entity } from '@shared/entities/Entity';

export interface UserUsageProps {
  userId: string;
  month: string;
  textInterviewsUsed: number;
  audioInterviewsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserUsage extends Entity<UserUsageProps> {
  constructor(props: UserUsageProps, id?: string) {
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get month(): string {
    return this.props.month;
  }

  get textInterviewsUsed(): number {
    return this.props.textInterviewsUsed;
  }

  get audioInterviewsUsed(): number {
    return this.props.audioInterviewsUsed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public incrementTextInterviews(): void {
    this.props.textInterviewsUsed++;
    this.props.updatedAt = new Date();
  }

  public incrementAudioInterviews(): void {
    this.props.audioInterviewsUsed++;
    this.props.updatedAt = new Date();
  }

  public static create(
    props: Omit<UserUsageProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): UserUsage {
    const now = new Date();
    return new UserUsage(
      {
        ...props,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
  }

  public static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
