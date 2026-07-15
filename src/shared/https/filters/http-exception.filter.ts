import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ExceptionResponse = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type ErrorResponseBody = {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = this.getStatusCode(exception);
    const exceptionResponse = this.getExceptionResponse(exception);
    const body = this.buildResponseBody(
      statusCode,
      exceptionResponse,
      request.url,
    );

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR.valueOf()) {
      this.logger.error(
        body.message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(body);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: unknown): ExceptionResponse {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          message: response,
          error: exception.name,
          statusCode: exception.getStatus(),
        };
      }

      return response;
    }

    return {
      message: 'Internal server error',
      error: 'InternalServerError',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private buildResponseBody(
    statusCode: number,
    exceptionResponse: ExceptionResponse,
    path: string,
  ): ErrorResponseBody {
    const messages = this.normalizeMessages(exceptionResponse.message);

    return {
      success: false,
      statusCode,
      message: messages[0],
      error: exceptionResponse.error ?? HttpStatus[statusCode],
      timestamp: new Date().toISOString(),
      path,
      ...(messages.length > 1 ? { details: messages } : {}),
    };
  }

  private normalizeMessages(message: string | string[] | undefined): string[] {
    if (Array.isArray(message) && message.length > 0) {
      return message;
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return [message];
    }

    return ['Unexpected error'];
  }
}
