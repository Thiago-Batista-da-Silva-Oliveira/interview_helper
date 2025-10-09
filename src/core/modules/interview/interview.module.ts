import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { AIModule } from '@infra/ai/ai.module';
import { UserModule } from '@modules/user/user.module';
import { PrismaInterviewRepository } from '@infra/database/prisma/repositories/PrismaInterviewRepository';
import { PrismaMessageRepository } from '@infra/database/prisma/repositories/PrismaMessageRepository';
import {
  INTERVIEW_REPOSITORY,
  MESSAGE_REPOSITORY,
} from './repositories/tokens';

// Use Cases
import { StartInterviewService } from './useCases/StartInterview/StartInterviewService';
import { SendMessageService } from './useCases/SendMessage/SendMessageService';
import { CompleteInterviewService } from './useCases/CompleteInterview/CompleteInterviewService';
import { GetInterviewHistoryService } from './useCases/GetInterviewHistory/GetInterviewHistoryService';
import { ListUserInterviewsService } from './useCases/ListUserInterviews/ListUserInterviewsService';
import { CancelInterviewService } from './useCases/CancelInterview/CancelInterviewService';

@Module({
  imports: [DatabaseModule, AIModule, UserModule],
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
    // Use Cases
    StartInterviewService,
    SendMessageService,
    CompleteInterviewService,
    GetInterviewHistoryService,
    ListUserInterviewsService,
    CancelInterviewService,
  ],
  exports: [
    StartInterviewService,
    SendMessageService,
    CompleteInterviewService,
    GetInterviewHistoryService,
    ListUserInterviewsService,
    CancelInterviewService,
  ],
})
export class InterviewModule {}
