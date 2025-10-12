import type { QuestionBank } from '@modules/question-bank/entities/QuestionBank';

/**
 * Constrói o prompt inicial da entrevista COM perguntas sugeridas do banco
 */
export function buildInterviewStartPromptWithQuestions(
  resumeDescription: string,
  jobDescription: string,
  suggestedQuestions: QuestionBank[],
): string {
  const questionsText = suggestedQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join('\n');

  return `Você está conduzindo uma entrevista simulada para a seguinte vaga:

DESCRIÇÃO DA VAGA:
${jobDescription}

CURRÍCULO DO CANDIDATO:
${resumeDescription}

PERGUNTAS SUGERIDAS DO BANCO (use como referência, mas adapte conforme necessário):
${questionsText}

Instruções importantes:
1. Comece a entrevista de forma profissional cumprimentando o candidato
2. Use as perguntas sugeridas acima como base, mas você tem flexibilidade para:
   - Adaptar a linguagem e o contexto às respostas do candidato
   - Fazer perguntas de follow-up relevantes
   - Criar perguntas adicionais se identificar algo interessante no currículo
   - Pular perguntas que não se aplicam bem ao contexto
3. Não precisa fazer TODAS as perguntas listadas - selecione as mais relevantes
4. Priorize a qualidade da conversa sobre seguir a lista rigidamente
5. Mantenha um tom profissional, empático e encorajador

Comece agora a entrevista fazendo a primeira pergunta mais relevante.`;
}

/**
 * Constrói o contexto de continuação da conversa COM perguntas sugeridas
 */
export function buildConversationContextWithQuestions(
  resumeDescription: string,
  jobDescription: string,
  suggestedQuestions: QuestionBank[],
  askedQuestionIds: string[],
): string {
  // Filtrar perguntas que ainda não foram feitas
  const remainingQuestions = suggestedQuestions.filter(
    (q) => !askedQuestionIds.includes(q.id.toString()),
  );

  if (remainingQuestions.length === 0) {
    return `CONTEXTO DA ENTREVISTA:

Vaga: ${jobDescription}

Currículo: ${resumeDescription}

Continue a entrevista baseado nas respostas anteriores do candidato.
Você já fez todas as perguntas sugeridas do banco, então agora crie perguntas relevantes baseadas no que foi discutido.`;
  }

  const questionsText = remainingQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join('\n');

  return `CONTEXTO DA ENTREVISTA:

Vaga: ${jobDescription}

Currículo: ${resumeDescription}

PERGUNTAS AINDA NÃO FEITAS (considere fazer alguma delas se relevante):
${questionsText}

Continue a entrevista baseado nas respostas anteriores do candidato.
Você pode fazer uma das perguntas sugeridas acima ou criar novas perguntas baseadas no que foi discutido.
Aprofunde em áreas importantes e mantenha a conversa natural.`;
}
