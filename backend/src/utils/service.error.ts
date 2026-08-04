/**
 * Domain HTTP exception with explicit status code and bilingual or string messages.
 */
import { HttpException } from '@nestjs/common';

interface ServiceErrorResponse {
  statusCode: number;
  message: string | string[] | { es: string; en: string };
}

export class ServiceError extends HttpException {
  /** @param response Status code and message payload stored on the exception. */
  constructor(response: ServiceErrorResponse) {
    super(response, response.statusCode);
  }
}
