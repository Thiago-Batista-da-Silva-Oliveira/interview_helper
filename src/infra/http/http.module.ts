import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '@modules/user/user.module';
import { AuthController } from '@infra/http/controllers/auth.controller';
import { JwtAuthGuard } from '@infra/http/guards/jwt-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class HttpModule {}
