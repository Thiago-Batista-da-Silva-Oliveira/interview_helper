import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { InterviewModule } from '@modules/interview/interview.module';
import { PrismaInterviewAnalyticsRepository } from '@infra/database/prisma/repositories/PrismaInterviewAnalyticsRepository';
import { INTERVIEW_ANALYTICS_REPOSITORY } from './repositories/tokens';

// Use Cases
import { AnalyzeInterviewService } from './useCases/AnalyzeInterview/AnalyzeInterviewService';

@Module({
  imports: [DatabaseModule, InterviewModule],
  providers: [
    // Repositories
    {
      provide: INTERVIEW_ANALYTICS_REPOSITORY,
      useClass: PrismaInterviewAnalyticsRepository,
    },
    // Use Cases
    AnalyzeInterviewService,
  ],
  exports: [
    // Repositories
    INTERVIEW_ANALYTICS_REPOSITORY,
    // Use Cases
    AnalyzeInterviewService,
  ],
})
export class AnalyticsModule {}
