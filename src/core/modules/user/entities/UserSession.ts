import { Entity } from '@shared/entities/Entity';

export interface UserSessionProps {
  userId: string;
  token: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export class UserSession extends Entity<UserSessionProps> {
  constructor(props: UserSessionProps, id?: string) {
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public isValid(): boolean {
    return this.props.isActive && !this.isExpired();
  }

  public static create(
    props: Omit<UserSessionProps, 'isActive' | 'createdAt'>,
    id?: string,
  ): UserSession {
    return new UserSession(
      {
        ...props,
        isActive: true,
        createdAt: new Date(),
      },
      id,
    );
  }
}
