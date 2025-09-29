export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  plan?: 'FREE' | 'PREMIUM';
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  plan: 'FREE' | 'PREMIUM';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<CreateUserData>): Promise<User>;
}