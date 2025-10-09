import { Message } from '../entities/Message';

export interface IMessageRepository {
  create(message: Message): Promise<void>;
  findById(id: string): Promise<Message | null>;
  findByInterviewId(interviewId: string): Promise<Message[]>;
  findLatestByInterviewId(interviewId: string, limit: number): Promise<Message[]>;
  deleteByInterviewId(interviewId: string): Promise<void>;
}
