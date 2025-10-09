import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import { IMessageDTO, MessageRole } from '../dtos/IMessageDTO';

export interface IMessageProps {
  interviewId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

export class Message extends Entity<IMessageProps> {
  get interviewId(): string {
    return this.props.interviewId;
  }

  get role(): MessageRole {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }

  get metadata(): Record<string, any> | null | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public isFromUser(): boolean {
    return this.props.role === MessageRole.USER;
  }

  public isFromAssistant(): boolean {
    return this.props.role === MessageRole.ASSISTANT;
  }

  public isSystem(): boolean {
    return this.props.role === MessageRole.SYSTEM;
  }

  public toDTO(): IMessageDTO {
    return {
      id: this.id.toString(),
      interviewId: this.interviewId,
      role: this.role,
      content: this.content,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }

  public static create(props: IMessageProps, id?: UniqueId): Message {
    if (!props.content || props.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    const message = new Message(props, id);
    return message;
  }
}
