import type { IListInterviewsResult } from '@modules/interview/repositories/IInterviewRepository';
import {
  InterviewPresenter,
  type InterviewResponse,
} from './interview.presenter';

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedInterviewsResponse {
  interviews: InterviewResponse[];
  metadata: PaginationMetadata;
}

export class PaginationPresenter {
  static toHTTP(data: IListInterviewsResult): PaginatedInterviewsResponse {
    return {
      interviews: InterviewPresenter.toHTTPList(data.interviews),
      metadata: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      },
    };
  }
}
