import { Injectable, Inject } from '@nestjs/common';
import type { IUserSessionRepository } from '@modules/user/repositories/IUserSessionRepository';
import type { ICache } from '@infra/cache/interfaces/ICache';
import { USER_SESSION_REPOSITORY_TOKEN } from '@modules/user/repositories/tokens';
import { CACHE_PROVIDER_TOKEN } from '@infra/cache/interfaces/tokens';

interface LogoutAllSessionsRequest {
  userId: string;
}

@Injectable()
export class LogoutAllSessionsService {
  constructor(
    @Inject(USER_SESSION_REPOSITORY_TOKEN)
    private readonly userSessionRepository: IUserSessionRepository,
    @Inject(CACHE_PROVIDER_TOKEN)
    private readonly cache: ICache,
  ) {}

  async execute(request: LogoutAllSessionsRequest): Promise<void> {
    const { userId } = request;

    await this.userSessionRepository.deactivateAllByUserId(userId);

    // Clear cached user data
    this.cache.del(`user:${userId}`);
  }
}
