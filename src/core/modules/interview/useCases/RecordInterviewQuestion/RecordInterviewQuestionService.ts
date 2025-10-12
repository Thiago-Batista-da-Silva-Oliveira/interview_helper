import { Injectable, Inject } from '@nestjs/common';
import type { IInterviewQuestionRepository } from '@modules/interview/repositories/IInterviewQuestionRepository';
import { INTERVIEW_QUESTION_REPOSITORY } from '@modules/interview/repositories/tokens';

interface IRecordInterviewQuestionRequest {
  interviewId: string;
  questionIds: string[];
}

@Injectable()
export class RecordInterviewQuestionService {
  constructor(
    @Inject(INTERVIEW_QUESTION_REPOSITORY)
    private interviewQuestionRepository: IInterviewQuestionRepository,
  ) {}

  async execute(request: IRecordInterviewQuestionRequest): Promise<void> {
    const { interviewId, questionIds } = request;

    // Validação básica
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }

    if (!questionIds || questionIds.length === 0) {
      // Se não há perguntas para registrar, retorna sem fazer nada
      return;
    }

    // Registrar perguntas em lote
    await this.interviewQuestionRepository.bulkCreate(interviewId, questionIds);
  }
}
