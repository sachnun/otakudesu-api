import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let details: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (responseObj.error as string) ||
          message;
        details = responseObj.details as string | undefined;
      }

      // Map status codes to error codes
      errorCode = this.getErrorCode(statusCode, request.url);
    } else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error: {
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorCode(statusCode: number, url: string): string {
    // Determine resource type from URL
    let resource = 'RESOURCE';
    if (url.includes('/anime/')) resource = 'ANIME';
    else if (url.includes('/episode/')) resource = 'EPISODE';
    else if (url.includes('/genres/')) resource = 'GENRE';
    else if (url.includes('/search')) resource = 'SEARCH';
    else if (url.includes('/resolve-streaming')) resource = 'STREAMING';

    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      404: `${resource}_NOT_FOUND`,
      502: 'UPSTREAM_ERROR',
      504: 'UPSTREAM_TIMEOUT',
      429: 'RATE_LIMIT_EXCEEDED',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
    };

    return statusMap[statusCode] || 'INTERNAL_ERROR';
  }
}
