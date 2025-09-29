import { Module } from '@nestjs/common';
import { PrismaModule } from '@infra/database/prisma/prisma.module';
import {
  USER_REPOSITORY_TOKEN,
  USER_SESSION_REPOSITORY_TOKEN,
  USER_USAGE_REPOSITORY_TOKEN,
} from '@modules/user/repositories/tokens';
import { PrismaUserRepository } from '@infra/database/prisma/repositories/PrismaUserRepository';
import { PrismaUserSessionRepository } from '@infra/database/prisma/repositories/PrismaUserSessionRepository';
import { PrismaUserUsageRepository } from '@infra/database/prisma/repositories/PrismaUserUsageRepository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    {
      provide: USER_SESSION_REPOSITORY_TOKEN,
      useClass: PrismaUserSessionRepository,
    },
    {
      provide: USER_USAGE_REPOSITORY_TOKEN,
      useClass: PrismaUserUsageRepository,
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    USER_SESSION_REPOSITORY_TOKEN,
    USER_USAGE_REPOSITORY_TOKEN,
  ],
})
export class DatabaseModule {}
