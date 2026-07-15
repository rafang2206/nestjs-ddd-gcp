import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

type SuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
};

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T> | T> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    if (this.shouldSkip(request.path)) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: this.getMessage(response.statusCode),
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  private shouldSkip(path: string): boolean {
    return path.startsWith('/docs') || path.startsWith('/docs-json');
  }

  private getMessage(statusCode: number): string {
    if (statusCode === 201) {
      return 'Resource created successfully';
    }

    if (statusCode === 204) {
      return 'Resource processed successfully';
    }

    return 'Request processed successfully';
  }
}
