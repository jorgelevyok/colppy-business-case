/**
 * Global exception filter: maps {@link ServiceError}, {@link HttpException},
 * and unknown errors to a consistent JSON error body for the frontend.
 */
import { RESPONSES } from '@config/constants';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceError } from '@utils/service.error';
import { Request, Response } from 'express';

/** Catches all exceptions and formats the HTTP response. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  constructor(private readonly config: ConfigService) {}

  /** Builds status, bilingual messages, and logs stack traces for 500s. */
  catch(exception: HttpException | ServiceError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { params, query, body } = ctx.getRequest<Request>();

    let messages: any = RESPONSES.INTERNAL_SERVER_ERROR.message;
    let status = 500;

    if (exception instanceof ServiceError) {
      status = exception.getStatus();
      messages = exception.getResponse();
    } else if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as any;
      status = exception.getStatus();
      const nestedMessage = errorResponse?.message;
      if (
        typeof errorResponse === 'object' &&
        errorResponse !== null &&
        typeof nestedMessage === 'object' &&
        nestedMessage !== null &&
        'es' in nestedMessage &&
        'en' in nestedMessage
      ) {
        messages = errorResponse;
      } else {
        messages = errorResponse['message'] ?? messages;
      }
    }

    if (status === 500) {
      this.logger.error(exception.stack);
    }

    if (this.config.get('debug')) {
      this.logger.debug(
        JSON.stringify({ params, query, body, status, messages }, null, 2),
      );
    }

    response.status(status).json({
      success: false,
      status: false,
      error: true,
      message: this.resolveClientMessage(messages),
      messages,
    });
  }

  /** Picks a single display string (prefers Spanish) for the `message` field. */
  private resolveClientMessage(messages: any): string {
    if (typeof messages === 'string' && messages.trim()) return messages.trim();
    if (Array.isArray(messages) && messages.length) {
      return messages
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item?.es) return item.es;
          return null;
        })
        .filter(Boolean)
        .join('. ');
    }
    if (messages && typeof messages === 'object') {
      if (typeof messages.es === 'string') return messages.es;
      if (typeof messages.message === 'string') return messages.message;
      if (typeof messages.message?.es === 'string') return messages.message.es;
    }
    return 'Ocurrió un error. Intentá nuevamente más tarde.';
  }
}
