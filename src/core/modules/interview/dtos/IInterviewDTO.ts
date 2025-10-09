export enum InterviewType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
}

export enum InterviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IInterviewDTO {
  id: string;
  userId: string;
  type: InterviewType;
  status: InterviewStatus;
  resumeDescription: string;
  jobDescription: string;
  feedback?: string | null;
  insights?: string | null;
  score?: number | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateInterviewDTO {
  userId: string;
  type: InterviewType;
  resumeDescription: string;
  jobDescription: string;
}

export interface IUpdateInterviewDTO {
  status?: InterviewStatus;
  feedback?: string;
  insights?: string;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
}
