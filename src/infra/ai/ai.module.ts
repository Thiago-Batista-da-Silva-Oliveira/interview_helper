import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIProvider } from './openai/openai-ai.provider';
import { AI_PROVIDER } from './interfaces/tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER,
      useClass: OpenAIProvider,
    },
  ],
  exports: [AI_PROVIDER],
})
export class AIModule {}
