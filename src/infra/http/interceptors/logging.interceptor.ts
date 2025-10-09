import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userId = request.user?.id || 'anonymous';
    const now = Date.now();

    this.logger.log(`[${method}] ${url} - User: ${userId} - Started`);

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const executionTime = Date.now() - now;

          this.logger.log(
            `[${method}] ${url} - User: ${userId} - Status: ${statusCode} - ${executionTime}ms`,
          );
        },
        error: (error) => {
          const executionTime = Date.now() - now;
          this.logger.error(
            `[${method}] ${url} - User: ${userId} - Error: ${error.message} - ${executionTime}ms`,
          );
        },
      }),
    );
  }
}
