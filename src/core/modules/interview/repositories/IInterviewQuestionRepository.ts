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
