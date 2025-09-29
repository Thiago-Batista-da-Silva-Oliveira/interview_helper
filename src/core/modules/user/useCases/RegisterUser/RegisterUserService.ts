import { Injectable, ConflictException, Inject } from '@nestjs/common';
import type { IUserRepository } from '@modules/user/repositories/IUserRepository';
import type { IUserUsageRepository } from '@modules/user/repositories/IUserUsageRepository';
import type { IHashProvider } from '@infra/cryptography/interfaces/IHashProvider';
import { UserResponseDto } from '@modules/user/dtos/UserResponseDto';
import { UserUsage } from '@modules/user/entities/UserUsage';
import { USER_REPOSITORY_TOKEN, USER_USAGE_REPOSITORY_TOKEN } from '@modules/user/repositories/tokens';
import { HASH_PROVIDER_TOKEN } from '@infra/cryptography/interfaces/tokens';

interface RegisterUserRequest {
  email: string;
  password: string;
  name: string;
}

@Injectable()
export class RegisterUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_USAGE_REPOSITORY_TOKEN)
    private readonly userUsageRepository: IUserUsageRepository,
    @Inject(HASH_PROVIDER_TOKEN)
    private readonly hashProvider: IHashProvider,
  ) {}

  async execute(request: RegisterUserRequest): Promise<UserResponseDto> {
    const { email, password, name } = request;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashProvider.hash(password);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      plan: 'FREE',
    });

    const currentMonth = UserUsage.getCurrentMonth();
    await this.userUsageRepository.create({
      userId: user.id,
      month: currentMonth,
      textInterviewsUsed: 0,
      audioInterviewsUsed: 0,
    });

    return new UserResponseDto(user);
  }
}