export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

export interface IMessageDTO {
  id: string;
  interviewId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

export interface ICreateMessageDTO {
  interviewId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
}
