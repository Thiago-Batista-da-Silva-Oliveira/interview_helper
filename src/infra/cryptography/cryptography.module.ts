import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  HASH_PROVIDER_TOKEN,
  JWT_PROVIDER_TOKEN,
} from '@infra/cryptography/interfaces/tokens';
import { BcryptHashProvider } from '@infra/cryptography/bcrypt/bcrypt-hash.provider';
import { JwtProvider } from '@infra/cryptography/jwt/jwt.provider';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: HASH_PROVIDER_TOKEN,
      useClass: BcryptHashProvider,
    },
    {
      provide: JWT_PROVIDER_TOKEN,
      useClass: JwtProvider,
    },
  ],
  exports: [HASH_PROVIDER_TOKEN, JWT_PROVIDER_TOKEN],
})
export class CryptographyModule {}
