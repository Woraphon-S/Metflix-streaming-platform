import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = isHttp ? (exception as HttpException).getResponse() : null;

    const message = this.extractMessage(payload, exception);
    const errorCode = this.extractCode(payload, status);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      ok: false,
      statusCode: status,
      error: errorCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private extractMessage(payload: unknown, exception: unknown): string {
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const candidate = (payload as { message: unknown }).message;
      if (Array.isArray(candidate)) return candidate.join(', ');
      if (typeof candidate === 'string') return candidate;
    }
    if (exception instanceof Error) return exception.message;
    return 'Unexpected error';
  }

  private extractCode(payload: unknown, status: number): string {
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const candidate = (payload as { error: unknown }).error;
      if (typeof candidate === 'string') return candidate;
    }
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    if (status === 404) return 'NotFound';
    if (status === 409) return 'Conflict';
    if (status === 422) return 'Unprocessable';
    if (status >= 500) return 'InternalError';
    return 'Error';
  }
}
