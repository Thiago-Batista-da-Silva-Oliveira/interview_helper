import type { Message } from '@modules/interview/entities/Message';

export interface MessageResponse {
  id: string;
  interviewId: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export class MessagePresenter {
  static toHTTP(message: Message): MessageResponse {
    return {
      id: message.id.toString(),
      interviewId: message.interviewId,
      role: message.role,
      content: message.content,
      metadata: message.metadata ?? null,
      createdAt: message.createdAt.toISOString(),
    };
  }

  static toHTTPList(messages: Message[]): MessageResponse[] {
    return messages.map((message) => this.toHTTP(message));
  }
}
