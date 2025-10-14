import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type {
  IInterviewQuestionRepository,
  IInterviewQuestion,
} from '@modules/interview/repositories/IInterviewQuestionRepository';

@Injectable()
export class PrismaInterviewQuestionRepository
  implements IInterviewQuestionRepository
{
  constructor(private prisma: PrismaService) {}

  async create(interviewId: string, questionId: string): Promise<void> {
    await this.prisma.interviewQuestion.create({
      data: {
        interviewId,
        questionId,
      },
    });
  }

  async bulkCreate(interviewId: string, questionIds: string[]): Promise<void> {
    // SQLite não suporta skipDuplicates, então inserimos um por um
    // Em produção com PostgreSQL, poderia usar createMany com skipDuplicates
    for (const questionId of questionIds) {
      try {
        await this.create(interviewId, questionId);
      } catch (error) {
        // Ignora erros de duplicata (unique constraint violation)
        // Continua para a próxima pergunta
        continue;
      }
    }
  }

  async findQuestionIdsByInterviewId(interviewId: string): Promise<string[]> {
    const interviewQuestions = await this.prisma.interviewQuestion.findMany({
      where: { interviewId },
      select: { questionId: true },
      orderBy: { askedAt: 'asc' },
    });

    return interviewQuestions.map((iq) => iq.questionId);
  }

  async findByInterviewId(interviewId: string): Promise<IInterviewQuestion[]> {
    const interviewQuestions = await this.prisma.interviewQuestion.findMany({
      where: { interviewId },
      include: {
        question: true,
      },
      orderBy: { askedAt: 'asc' },
    });

    return interviewQuestions.map((iq) => ({
      id: iq.id,
      interviewId: iq.interviewId,
      questionId: iq.questionId,
      askedAt: iq.askedAt,
      question: {
        id: iq.question.id,
        category: iq.question.category,
        level: iq.question.level,
        difficulty: iq.question.difficulty,
        question: iq.question.question,
        tags: iq.question.tags,
      },
    }));
  }

  async hasQuestionBeenUsed(
    interviewId: string,
    questionId: string,
  ): Promise<boolean> {
    const count = await this.prisma.interviewQuestion.count({
      where: {
        interviewId,
        questionId,
      },
    });

    return count > 0;
  }

  async deleteByInterviewId(interviewId: string): Promise<void> {
    await this.prisma.interviewQuestion.deleteMany({
      where: { interviewId },
    });
  }
}
