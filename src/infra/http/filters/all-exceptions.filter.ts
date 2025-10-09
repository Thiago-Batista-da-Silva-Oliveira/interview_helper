import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  stack?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    // Log the complete error
    this.logger.error(
      `Unhandled Exception: ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace available',
    );

    response.status(status).json(errorResponse);
  }
}
