import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { PrismaQuestionBankRepository } from '@infra/database/prisma/repositories/PrismaQuestionBankRepository';
import { QUESTION_BANK_REPOSITORY } from './repositories/tokens';

// Use Cases
import { SelectQuestionsService } from './useCases/SelectQuestions/SelectQuestionsService';

@Module({
  imports: [DatabaseModule],
  providers: [
    // Repository
    {
      provide: QUESTION_BANK_REPOSITORY,
      useClass: PrismaQuestionBankRepository,
    },
    // Use Cases
    SelectQuestionsService,
  ],
  exports: [
    // Exportar repositório para uso em outros módulos
    QUESTION_BANK_REPOSITORY,
    // Exportar use cases
    SelectQuestionsService,
  ],
})
export class QuestionBankModule {}
