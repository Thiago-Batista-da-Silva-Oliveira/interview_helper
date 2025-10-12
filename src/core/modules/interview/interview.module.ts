import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { AIModule } from '@infra/ai/ai.module';
import { UserModule } from '@modules/user/user.module';
import { QuestionBankModule } from '@modules/question-bank/question-bank.module';
import { PrismaInterviewRepository } from '@infra/database/prisma/repositories/PrismaInterviewRepository';
import { PrismaMessageRepository } from '@infra/database/prisma/repositories/PrismaMessageRepository';
import { PrismaInterviewQuestionRepository } from '@infra/database/prisma/repositories/PrismaInterviewQuestionRepository';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
  INTERVIEW_QUESTION_REPOSITORY,
} from './repositories/tokens';

// Use Cases
import { StartInterviewService } from './useCases/StartInterview/StartInterviewService';
import { SendMessageService } from './useCases/SendMessage/SendMessageService';
import { CompleteInterviewService } from './useCases/CompleteInterview/CompleteInterviewService';
import { GetInterviewHistoryService } from './useCases/GetInterviewHistory/GetInterviewHistoryService';
import { ListUserInterviewsService } from './useCases/ListUserInterviews/ListUserInterviewsService';
import { CancelInterviewService } from './useCases/CancelInterview/CancelInterviewService';
import { RecordInterviewQuestionService } from './useCases/RecordInterviewQuestion/RecordInterviewQuestionService';

@Module({
  imports: [DatabaseModule, AIModule, UserModule, QuestionBankModule],
  providers: [
    // Repositories
    {
      provide: INTERVIEW_REPOSITORY,
      useClass: PrismaInterviewRepository,
    },
    {
      provide: MESSAGE_REPOSITORY,
      useClass: PrismaMessageRepository,
    },
    {
      provide: INTERVIEW_QUESTION_REPOSITORY,
      useClass: PrismaInterviewQuestionRepository,
    },
    // Use Cases
    StartInterviewService,
    SendMessageService,
    CompleteInterviewService,
    GetInterviewHistoryService,
    ListUserInterviewsService,
    CancelInterviewService,
    RecordInterviewQuestionService,
  ],
  exports: [
    // Repositories (needed by middlewares)
    INTERVIEW_REPOSITORY,
    MESSAGE_REPOSITORY,
    INTERVIEW_QUESTION_REPOSITORY,
    // Use Cases
    StartInterviewService,
    SendMessageService,
    CompleteInterviewService,
    GetInterviewHistoryService,
    ListUserInterviewsService,
    CancelInterviewService,
    RecordInterviewQuestionService,
  ],
})
export class InterviewModule {}
