import { Injectable, Inject } from '@nestjs/common';
import type { IUserSessionRepository } from '@modules/user/repositories/IUserSessionRepository';
import type { ICache } from '@infra/cache/interfaces/ICache';
import { USER_SESSION_REPOSITORY_TOKEN } from '@modules/user/repositories/tokens';
import { CACHE_PROVIDER_TOKEN } from '@infra/cache/interfaces/tokens';

interface LogoutUserRequest {
  token: string;
}

@Injectable()
export class LogoutUserService {
  constructor(
    @Inject(USER_SESSION_REPOSITORY_TOKEN)
    private readonly userSessionRepository: IUserSessionRepository,
    @Inject(CACHE_PROVIDER_TOKEN)
    private readonly cache: ICache,
  ) {}

  async execute(request: LogoutUserRequest): Promise<void> {
    const { token } = request;

    const session = await this.userSessionRepository.findByToken(token);
    if (session) {
      await this.userSessionRepository.deactivate(session.id);

      // Clear any cached user data
      this.cache.del(`user:${session.userId}`);
      this.cache.del(`session:${token}`);
    }
  }
}
