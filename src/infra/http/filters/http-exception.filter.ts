import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  stack?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = exception.message;
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse &&
      'message' in exceptionResponse
    ) {
      const responseMessage = exceptionResponse.message;
      if (
        typeof responseMessage === 'string' ||
        Array.isArray(responseMessage)
      ) {
        message = responseMessage;
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = exception.stack;
    }

    // Log the error
    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify(message)}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
