import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { IUserRepository } from '@modules/user/repositories/IUserRepository';
import type { IUserSessionRepository } from '@modules/user/repositories/IUserSessionRepository';
import type { IJwtProvider } from '@infra/cryptography/interfaces/IJwtProvider';
import type { ICache } from '@infra/cache/interfaces/ICache';
import { UserResponseDto } from '@modules/user/dtos/UserResponseDto';
import {
  USER_REPOSITORY_TOKEN,
  USER_SESSION_REPOSITORY_TOKEN,
} from '@modules/user/repositories/tokens';
import { JWT_PROVIDER_TOKEN } from '@infra/cryptography/interfaces/tokens';
import { CACHE_PROVIDER_TOKEN } from '@infra/cache/interfaces/tokens';

interface ValidateTokenRequest {
  token: string;
}

@Injectable()
export class ValidateTokenService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_SESSION_REPOSITORY_TOKEN)
    private readonly userSessionRepository: IUserSessionRepository,
    @Inject(JWT_PROVIDER_TOKEN)
    private readonly jwtProvider: IJwtProvider,
    @Inject(CACHE_PROVIDER_TOKEN)
    private readonly cache: ICache,
  ) {}

  async execute(request: ValidateTokenRequest): Promise<UserResponseDto> {
    const { token } = request;

    try {
      const payload = this.jwtProvider.verify(token);

      // Check cache first
      const cachedUser = this.cache.get<UserResponseDto>(`user:${payload.sub}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Verify session is still active
      const session = await this.userSessionRepository.findByToken(token);
      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const userResponse = new UserResponseDto(user);

      // Cache for 5 minutes
      this.cache.set(`user:${user.id}`, userResponse, 300);

      return userResponse;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
