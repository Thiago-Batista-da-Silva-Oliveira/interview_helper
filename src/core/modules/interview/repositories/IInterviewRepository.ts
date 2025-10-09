import { Interview } from '../entities/Interview';
import { InterviewStatus, InterviewType } from '../dtos/IInterviewDTO';

export interface IListInterviewsFilters {
  status?: InterviewStatus;
  type?: InterviewType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IListInterviewsResult {
  interviews: Interview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IInterviewRepository {
  create(interview: Interview): Promise<void>;
  findById(id: string): Promise<Interview | null>;
  findByUserId(userId: string, filters?: IListInterviewsFilters): Promise<IListInterviewsResult>;
  update(interview: Interview): Promise<void>;
  delete(id: string): Promise<void>;
}
