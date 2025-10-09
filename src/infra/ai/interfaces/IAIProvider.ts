export interface IAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IAIResponse {
  content: string;
  tokens?: number;
}

export interface IGenerateFeedbackParams {
  resumeDescription: string;
  jobDescription: string;
  messages: IAIMessage[];
}

export interface IFeedbackResponse {
  feedback: string;
  insights: string;
  score: number;
}

export interface IAIProvider {
  sendMessage(
    messages: IAIMessage[],
    context?: Record<string, any>,
  ): Promise<IAIResponse>;

  generateFeedback(params: IGenerateFeedbackParams): Promise<IFeedbackResponse>;
}
