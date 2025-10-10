import type { QuestionBank } from '../entities/QuestionBank';
import type { IQuestionSelectionCriteria } from '../dtos/IQuestionBankDTO';

export interface IQuestionBankRepository {
  create(question: QuestionBank): Promise<void>;
  findById(id: string): Promise<QuestionBank | null>;
  findByCriteria(criteria: IQuestionSelectionCriteria): Promise<QuestionBank[]>;
  findAll(onlyActive?: boolean): Promise<QuestionBank[]>;
  update(question: QuestionBank): Promise<void>;
  delete(id: string): Promise<void>;
  count(criteria?: Partial<IQuestionSelectionCriteria>): Promise<number>;
}
