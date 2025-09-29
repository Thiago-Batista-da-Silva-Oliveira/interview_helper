export interface CreateUserSessionData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUserSessionRepository {
  create(data: CreateUserSessionData): Promise<UserSession>;
  findByToken(token: string): Promise<UserSession | null>;
  findActiveByUserId(userId: string): Promise<UserSession[]>;
  deactivate(id: string): Promise<void>;
  deactivateAllByUserId(userId: string): Promise<void>;
}