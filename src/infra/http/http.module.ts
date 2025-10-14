import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from '@modules/user/user.module';
import { InterviewModule } from '@modules/interview/interview.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { AuthController } from '@infra/http/controllers/auth.controller';
import { InterviewController } from '@infra/http/controllers/interview.controller';
import { HealthController } from '@infra/http/controllers/health.controller';
import { JwtAuthGuard } from '@infra/http/guards/jwt-auth.guard';
import { AllExceptionsFilter } from '@infra/http/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '@infra/http/filters/http-exception.filter';
import { LoggingInterceptor } from '@infra/http/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from '@infra/http/interceptors/transform-response.interceptor';
import { CheckInterviewOwnerMiddleware } from '@infra/http/middlewares/check-interview-owner.middleware';

@Module({
  imports: [UserModule, InterviewModule, AnalyticsModule],
  controllers: [AuthController, InterviewController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class HttpModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CheckInterviewOwnerMiddleware)
      .forRoutes(
        { path: 'interviews/:id/messages', method: RequestMethod.POST },
        { path: 'interviews/:id/complete', method: RequestMethod.POST },
        { path: 'interviews/:id', method: RequestMethod.GET },
        { path: 'interviews/:id/cancel', method: RequestMethod.PATCH },
      );
  }
}
