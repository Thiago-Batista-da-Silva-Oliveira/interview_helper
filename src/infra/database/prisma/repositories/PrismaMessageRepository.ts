import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IMessageRepository } from '@core/modules/interview/repositories/IMessageRepository';
import { Message } from '@core/modules/interview/entities/Message';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import { MessageRole } from '@core/modules/interview/dtos/IMessageDTO';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private prisma: PrismaService) {}

  async create(message: Message): Promise<void> {
    await this.prisma.message.create({
      data: {
        id: message.id.toString(),
        interviewId: message.interviewId,
        role: message.role,
        content: message.content,
        metadata: message.metadata ? JSON.stringify(message.metadata) : null,
        createdAt: message.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return null;
    }

    return Message.create(
      {
        interviewId: message.interviewId,
        role: message.role as MessageRole,
        content: message.content,
        metadata: message.metadata ? JSON.parse(message.metadata) : null,
        createdAt: message.createdAt,
      },
      new UniqueId(message.id),
    );
  }

  async findByInterviewId(interviewId: string): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) =>
      Message.create(
        {
          interviewId: message.interviewId,
          role: message.role as MessageRole,
          content: message.content,
          metadata: message.metadata ? JSON.parse(message.metadata) : null,
          createdAt: message.createdAt,
        },
        new UniqueId(message.id),
      ),
    );
  }

  async findLatestByInterviewId(
    interviewId: string,
    limit: number,
  ): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse().map((message) =>
      Message.create(
        {
          interviewId: message.interviewId,
          role: message.role as MessageRole,
          content: message.content,
          metadata: message.metadata ? JSON.parse(message.metadata) : null,
          createdAt: message.createdAt,
        },
        new UniqueId(message.id),
      ),
    );
  }

  async deleteByInterviewId(interviewId: string): Promise<void> {
    await this.prisma.message.deleteMany({
      where: { interviewId },
    });
  }
}
