import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorResponse = {
  message: string;
  code: string;
  statusCode: number;
  path: string;
};

type ExceptionBody = {
  message?: string | string[];
  code?: string;
  error?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<{ url?: string }>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.getExceptionBody(exception);

    response.status(statusCode).json({
      message: this.resolveMessage(body, statusCode),
      code: this.resolveCode(body, statusCode),
      statusCode,
      path: request.url ?? '',
    } satisfies ErrorResponse);
  }

  private getExceptionBody(exception: unknown): ExceptionBody {
    if (!(exception instanceof HttpException)) {
      return {};
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response };
    }

    if (typeof response === 'object' && response !== null) {
      return response as ExceptionBody;
    }

    return {};
  }

  private resolveMessage(body: ExceptionBody, statusCode: number): string {
    if (Array.isArray(body.message)) {
      return body.message.join('; ');
    }

    if (body.message) {
      return body.message;
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error';
    }

    return body.error ?? 'Request failed';
  }

  private resolveCode(body: ExceptionBody, statusCode: number): string {
    if (body.code) {
      return body.code;
    }

    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'VALIDATION_ERROR';
    }

    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'NOT_FOUND';
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'INTERNAL_ERROR';
    }

    return 'REQUEST_FAILED';
  }
}
