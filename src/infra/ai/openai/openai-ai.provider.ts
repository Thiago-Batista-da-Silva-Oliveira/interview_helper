import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAIProvider,
  IAIMessage,
  IAIResponse,
  IGenerateFeedbackParams,
  IFeedbackResponse,
} from '../interfaces/IAIProvider';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;
  private model: string;
  private maxTokens: number;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    if (!apiKey) {
      throw new Error('AI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.model = this.configService.get<string>('AI_MODEL') || 'gpt-4o-mini';
    this.maxTokens = this.configService.get<number>('AI_MAX_TOKENS') || 2000;
  }

  async sendMessage(
    messages: IAIMessage[],
    context?: Record<string, any>,
  ): Promise<IAIResponse> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokens = response.usage?.total_tokens;

      return {
        content,
        tokens,
      };
    } catch (error) {
      throw new Error(`Failed to send message to AI: ${error.message}`);
    }
  }

  async generateFeedback(
    params: IGenerateFeedbackParams,
  ): Promise<IFeedbackResponse> {
    const { resumeDescription, jobDescription, messages } = params;

    const feedbackPrompt = this.buildFeedbackPrompt(
      resumeDescription,
      jobDescription,
      messages,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: feedbackPrompt,
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content:
              'Por favor, gere o feedback completo da entrevista no formato JSON especificado.',
          },
        ],
        max_tokens: 3000,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);

      return {
        feedback: result.feedback || 'Feedback não disponível',
        insights: result.insights || 'Insights não disponíveis',
        score: result.score || 50,
      };
    } catch (error) {
      throw new Error(`Failed to generate feedback: ${error.message}`);
    }
  }

  private buildFeedbackPrompt(
    resumeDescription: string,
    jobDescription: string,
    messages: IAIMessage[],
  ): string {
    return `Você é um avaliador especializado de entrevistas de emprego.

Contexto da entrevista:
- Currículo do candidato: ${resumeDescription}
- Descrição da vaga: ${jobDescription}

Analise toda a conversa da entrevista que aconteceu e gere um feedback completo e construtivo.

Retorne sua análise no seguinte formato JSON:
{
  "feedback": "Análise detalhada da performance do candidato na entrevista. Inclua pontos fortes, áreas de melhoria, qualidade das respostas, comunicação, e sugestões específicas de como melhorar.",
  "insights": "Análise do alinhamento entre o currículo e a vaga. Inclua gaps de habilidades identificados, sugestões de como melhorar o currículo, competências que devem ser destacadas, e recomendações de desenvolvimento.",
  "score": 85
}

Critérios para o score (0-100):
- 90-100: Excelente performance, candidato muito bem preparado
- 75-89: Boa performance, algumas áreas de melhoria
- 60-74: Performance adequada, várias áreas precisam de desenvolvimento
- 40-59: Performance abaixo do esperado, necessita preparação significativa
- 0-39: Performance inadequada

Seja honesto, construtivo e específico nas suas avaliações. Foque em fornecer feedback acionável.`;
  }
}
