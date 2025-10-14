import { Entity } from '@core/shared/entities/Entity';
import { UniqueId } from '@core/shared/entities/value-objects/UniqueId';
import type {
  IQuestionBankDTO,
  ICreateQuestionBankDTO,
  QuestionCategory,
  QuestionLevel,
  QuestionDifficulty,
} from '../dtos/IQuestionBankDTO';

interface IQuestionBankProps {
  category: QuestionCategory;
  level: QuestionLevel;
  difficulty: QuestionDifficulty;
  question: string;
  suggestedAnswer: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class QuestionBank extends Entity<IQuestionBankProps> {
  private constructor(props: IQuestionBankProps, id?: UniqueId | string) {
    super(props, id);
  }

  static create(data: ICreateQuestionBankDTO, id?: string): QuestionBank {
    const now = new Date();

    return new QuestionBank(
      {
        category: data.category,
        level: data.level,
        difficulty: data.difficulty,
        question: data.question,
        suggestedAnswer: data.suggestedAnswer ?? null,
        tags: data.tags,
        isActive: data.isActive ?? true,
        createdAt: id ? now : now,
        updatedAt: now,
      },
      id ? new UniqueId(id) : undefined,
    );
  }

  // Getters
  get category(): QuestionCategory {
    return this.props.category;
  }

  get level(): QuestionLevel {
    return this.props.level;
  }

  get difficulty(): QuestionDifficulty {
    return this.props.difficulty;
  }

  get question(): string {
    return this.props.question;
  }

  get suggestedAnswer(): string | null {
    return this.props.suggestedAnswer;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Methods
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  update(data: Partial<IQuestionBankProps>): void {
    Object.assign(this.props, data);
    this.props.updatedAt = new Date();
  }

  hasTag(tag: string): boolean {
    return this.props.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  }

  matchesCategory(category: QuestionCategory): boolean {
    return this.props.category === category;
  }

  matchesLevel(level: QuestionLevel): boolean {
    return this.props.level === level;
  }

  toDTO(): IQuestionBankDTO {
    return {
      id: this.id.toString(),
      category: this.props.category,
      level: this.props.level,
      difficulty: this.props.difficulty,
      question: this.props.question,
      suggestedAnswer: this.props.suggestedAnswer,
      tags: this.props.tags,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
