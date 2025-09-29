export interface CreateUserUsageData {
  userId: string;
  month: string;
  textInterviewsUsed?: number;
  audioInterviewsUsed?: number;
}

export interface UserUsage {
  id: string;
  userId: string;
  month: string;
  textInterviewsUsed: number;
  audioInterviewsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserUsageRepository {
  create(data: CreateUserUsageData): Promise<UserUsage>;
  findByUserAndMonth(userId: string, month: string): Promise<UserUsage | null>;
  update(id: string, data: Partial<CreateUserUsageData>): Promise<UserUsage>;
  incrementTextInterviews(userId: string, month: string): Promise<UserUsage>;
  incrementAudioInterviews(userId: string, month: string): Promise<UserUsage>;
}
