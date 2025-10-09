import type { Interview } from '@modules/interview/entities/Interview';

export interface InterviewResponse {
  id: string;
  userId: string;
  type: string;
  status: string;
  resumeDescription: string;
  jobDescription: string;
  feedback: string | null;
  insights: string | null;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class InterviewPresenter {
  static toHTTP(interview: Interview): InterviewResponse {
    return {
      id: interview.id.toString(),
      userId: interview.userId,
      type: interview.type,
      status: interview.status,
      resumeDescription: interview.resumeDescription,
      jobDescription: interview.jobDescription,
      feedback: interview.feedback ?? null,
      insights: interview.insights ?? null,
      score: interview.score ?? null,
      startedAt: interview.startedAt ? interview.startedAt.toISOString() : null,
      completedAt: interview.completedAt
        ? interview.completedAt.toISOString()
        : null,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    };
  }

  static toHTTPList(interviews: Interview[]): InterviewResponse[] {
    return interviews.map((interview) => this.toHTTP(interview));
  }
}
