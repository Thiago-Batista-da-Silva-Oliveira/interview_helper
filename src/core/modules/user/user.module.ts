import { Module } from '@nestjs/common';
import { CryptographyModule } from '@infra/cryptography/cryptography.module';
import { CacheModule } from '@infra/cache/cache.module';
import { DatabaseModule } from '@infra/database/database.module';
import { RegisterUserService } from '@modules/user/useCases/RegisterUser/RegisterUserService';
import { LoginUserService } from '@modules/user/useCases/LoginUser/LoginUserService';
import { LogoutUserService } from '@modules/user/useCases/LogoutUser/LogoutUserService';
import { LogoutAllSessionsService } from '@modules/user/useCases/LogoutAllSessions/LogoutAllSessionsService';
import { ValidateTokenService } from '@modules/user/useCases/ValidateToken/ValidateTokenService';
import { CheckUserUsageService } from '@modules/user/useCases/CheckUserUsage/CheckUserUsageService';
import { IncrementUserUsageService } from '@modules/user/useCases/IncrementUserUsage/IncrementUserUsageService';

@Module({
  imports: [CryptographyModule, CacheModule, DatabaseModule],
  providers: [
    RegisterUserService,
    LoginUserService,
    LogoutUserService,
    LogoutAllSessionsService,
    ValidateTokenService,
    CheckUserUsageService,
    IncrementUserUsageService,
  ],
  exports: [
    RegisterUserService,
    LoginUserService,
    LogoutUserService,
    LogoutAllSessionsService,
    ValidateTokenService,
    CheckUserUsageService,
    IncrementUserUsageService,
  ],
})
export class UserModule {}
