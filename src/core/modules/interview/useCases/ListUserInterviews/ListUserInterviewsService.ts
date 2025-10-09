import { Injectable, Inject } from '@nestjs/common';
import type {
  IInterviewRepository,
  IListInterviewsFilters,
  IListInterviewsResult,
} from '@modules/interview/repositories/IInterviewRepository';
import { INTERVIEW_REPOSITORY } from '@modules/interview/repositories/tokens';
import {
  InterviewStatus,
  InterviewType,
} from '@modules/interview/dtos/IInterviewDTO';

interface IListUserInterviewsRequest {
  userId: string;
  status?: InterviewStatus;
  type?: InterviewType;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ListUserInterviewsService {
  constructor(
    @Inject(INTERVIEW_REPOSITORY)
    private interviewRepository: IInterviewRepository,
  ) {}

  async execute(
    request: IListUserInterviewsRequest,
  ): Promise<IListInterviewsResult> {
    const { userId, status, type, page, limit, sortBy, sortOrder } = request;

    const filters: IListInterviewsFilters = {
      status,
      type,
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
    };

    return await this.interviewRepository.findByUserId(userId, filters);
  }
}
