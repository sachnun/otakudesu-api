import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data: T) => {
        const responseTime = `${Date.now() - startTime}ms`;

        // Set response time header
        response.setHeader('X-Response-Time', responseTime);

        return {
          success: true,
          statusCode: response.statusCode,
          message: 'OK',
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          responseTime,
        };
      }),
    );
  }
}
