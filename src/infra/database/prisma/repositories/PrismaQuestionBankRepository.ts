import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { IQuestionBankRepository } from '@modules/question-bank/repositories/IQuestionBankRepository';
import { QuestionBank } from '@modules/question-bank/entities/QuestionBank';
import type { IQuestionSelectionCriteria } from '@modules/question-bank/dtos/IQuestionBankDTO';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';

@Injectable()
export class PrismaQuestionBankRepository implements IQuestionBankRepository {
  constructor(private prisma: PrismaService) {}

  async create(question: QuestionBank): Promise<void> {
    await this.prisma.questionBank.create({
      data: {
        id: question.id.toString(),
        category: question.category,
        level: question.level,
        difficulty: question.difficulty,
        question: question.question,
        suggestedAnswer: question.suggestedAnswer,
        tags: JSON.stringify(question.tags),
        isActive: question.isActive,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<QuestionBank | null> {
    const question = await this.prisma.questionBank.findUnique({
      where: { id },
    });

    if (!question) {
      return null;
    }

    return this.toDomain(question);
  }

  async findByCriteria(
    criteria: IQuestionSelectionCriteria,
  ): Promise<QuestionBank[]> {
    const where: Record<string, unknown> = {
      isActive: true, // Sempre retornar apenas perguntas ativas
    };

    if (criteria.categories && criteria.categories.length > 0) {
      where.category = { in: criteria.categories };
    }

    if (criteria.levels && criteria.levels.length > 0) {
      where.level = { in: criteria.levels };
    }

    if (criteria.difficulties && criteria.difficulties.length > 0) {
      where.difficulty = { in: criteria.difficulties };
    }

    // Para filtrar por tags, precisamos fazer um filtro manual pós-query
    // já que tags está em JSON string no banco
    let questions = await this.prisma.questionBank.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: criteria.limit || 100,
    });

    // Filtrar por tags se especificado
    if (criteria.tags && criteria.tags.length > 0) {
      questions = questions.filter((q) => {
        const questionTags: string[] = JSON.parse(q.tags);
        return criteria.tags!.some((tag) =>
          questionTags.some((qt) => qt.toLowerCase() === tag.toLowerCase()),
        );
      });
    }

    // Excluir perguntas já usadas
    if (criteria.excludeQuestionIds && criteria.excludeQuestionIds.length > 0) {
      questions = questions.filter(
        (q) => !criteria.excludeQuestionIds!.includes(q.id),
      );
    }

    return questions.map((q) => this.toDomain(q));
  }

  async findAll(onlyActive: boolean = true): Promise<QuestionBank[]> {
    const questions = await this.prisma.questionBank.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ category: 'asc' }, { level: 'asc' }, { difficulty: 'asc' }],
    });

    return questions.map((q) => this.toDomain(q));
  }

  async update(question: QuestionBank): Promise<void> {
    await this.prisma.questionBank.update({
      where: { id: question.id.toString() },
      data: {
        category: question.category,
        level: question.level,
        difficulty: question.difficulty,
        question: question.question,
        suggestedAnswer: question.suggestedAnswer,
        tags: JSON.stringify(question.tags),
        isActive: question.isActive,
        updatedAt: question.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.questionBank.delete({
      where: { id },
    });
  }

  async count(criteria?: Partial<IQuestionSelectionCriteria>): Promise<number> {
    const where: Record<string, unknown> = {};

    if (criteria?.categories && criteria.categories.length > 0) {
      where.category = { in: criteria.categories };
    }

    if (criteria?.levels && criteria.levels.length > 0) {
      where.level = { in: criteria.levels };
    }

    if (criteria?.difficulties && criteria.difficulties.length > 0) {
      where.difficulty = { in: criteria.difficulties };
    }

    return await this.prisma.questionBank.count({ where });
  }

  private toDomain(raw: {
    id: string;
    category: string;
    level: string;
    difficulty: string;
    question: string;
    suggestedAnswer: string | null;
    tags: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): QuestionBank {
    return QuestionBank.create(
      {
        category: raw.category as never,
        level: raw.level as never,
        difficulty: raw.difficulty as never,
        question: raw.question,
        suggestedAnswer: raw.suggestedAnswer ?? undefined,
        tags: JSON.parse(raw.tags) as string[],
        isActive: raw.isActive,
      },
      raw.id,
    );
  }
}
