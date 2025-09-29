export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PREMIUM';
  createdAt: Date;
  updatedAt: Date;

  constructor(user: {
    id: string;
    email: string;
    name: string;
    plan: 'FREE' | 'PREMIUM';
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.plan = user.plan;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}