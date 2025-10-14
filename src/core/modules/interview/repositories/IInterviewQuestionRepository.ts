export interface IInterviewQuestion {
  id: string;
  interviewId: string;
  questionId: string;
  askedAt: Date;
  question: {
    id: string;
    category: string;
    level: string;
    difficulty: string;
    question: string;
    tags: string;
  };
}

export interface IInterviewQuestionRepository {
  /**
   * Registra uma única pergunta usada em uma entrevista
   */
  create(interviewId: string, questionId: string): Promise<void>;

  /**
   * Registra múltiplas perguntas usadas em uma entrevista (bulk insert)
   */
  bulkCreate(interviewId: string, questionIds: string[]): Promise<void>;

  /**
   * Busca IDs de todas as perguntas usadas em uma entrevista
   */
  findQuestionIdsByInterviewId(interviewId: string): Promise<string[]>;

  /**
   * Busca todas as perguntas usadas em uma entrevista (com dados completos)
   */
  findByInterviewId(interviewId: string): Promise<IInterviewQuestion[]>;

  /**
   * Verifica se uma pergunta específica já foi usada em uma entrevista
   */
  hasQuestionBeenUsed(
    interviewId: string,
    questionId: string,
  ): Promise<boolean>;

  /**
   * Remove todas as perguntas associadas a uma entrevista
   */
  deleteByInterviewId(interviewId: string): Promise<void>;
}
