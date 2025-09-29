import { Entity } from '@shared/entities/Entity';

export enum UserPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface UserProps {
  email: string;
  password: string;
  name: string;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get name(): string {
    return this.props.name;
  }

  get plan(): UserPlan {
    return this.props.plan;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public changePlan(plan: UserPlan): void {
    this.props.plan = plan;
    this.props.updatedAt = new Date();
  }

  public updateProfile(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public static create(props: Omit<UserProps, 'createdAt' | 'updatedAt'>, id?: string): User {
    const now = new Date();
    return new User(
      {
        ...props,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
  }
}