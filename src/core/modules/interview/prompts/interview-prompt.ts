export function buildInterviewStartPrompt(
  resumeDescription: string,
  jobDescription: string,
): string {
  return `Você está conduzindo uma entrevista simulada para a seguinte vaga:

DESCRIÇÃO DA VAGA:
${jobDescription}

CURRÍCULO DO CANDIDATO:
${resumeDescription}

Comece a entrevista de forma profissional:
1. Cumprimente o candidato
2. Apresente-se brevemente como entrevistador
3. Explique que você analisou o currículo e a vaga
4. Faça a primeira pergunta relevante (pode ser técnica, comportamental ou sobre experiência)

Seja direto, profissional e engajante. Não faça uma introdução muito longa.`;
}

export function buildConversationContext(
  resumeDescription: string,
  jobDescription: string,
): string {
  return `CONTEXTO DA ENTREVISTA:

Vaga: ${jobDescription}

Currículo: ${resumeDescription}

Continue a entrevista baseado nas respostas anteriores do candidato. Faça perguntas relevantes e aprofunde em áreas importantes.`;
}
