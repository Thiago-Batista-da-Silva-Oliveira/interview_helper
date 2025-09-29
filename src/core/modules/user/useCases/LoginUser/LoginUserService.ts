import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { IUserRepository } from '@modules/user/repositories/IUserRepository';
import type { IUserSessionRepository } from '@modules/user/repositories/IUserSessionRepository';
import type { IHashProvider } from '@infra/cryptography/interfaces/IHashProvider';
import type { IJwtProvider } from '@infra/cryptography/interfaces/IJwtProvider';
import { UserResponseDto } from '@modules/user/dtos/UserResponseDto';
import {
  USER_REPOSITORY_TOKEN,
  USER_SESSION_REPOSITORY_TOKEN,
} from '@modules/user/repositories/tokens';
import {
  HASH_PROVIDER_TOKEN,
  JWT_PROVIDER_TOKEN,
} from '@infra/cryptography/interfaces/tokens';

interface LoginUserRequest {
  email: string;
  password: string;
}

interface LoginUserResponse {
  user: UserResponseDto;
  token: string;
}

@Injectable()
export class LoginUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_SESSION_REPOSITORY_TOKEN)
    private readonly userSessionRepository: IUserSessionRepository,
    @Inject(HASH_PROVIDER_TOKEN)
    private readonly hashProvider: IHashProvider,
    @Inject(JWT_PROVIDER_TOKEN)
    private readonly jwtProvider: IJwtProvider,
  ) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    const { email, password } = request;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashProvider.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtProvider.sign({
      sub: user.id,
      email: user.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.userSessionRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });

    return {
      user: new UserResponseDto(user),
      token,
    };
  }
}
