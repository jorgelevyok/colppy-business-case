/**
 * Wraps successful controller results in `{ success, status, error, data }`.
 * Supports a legacy paginated shape when handlers return `{ data, totalPages }`.
 */
import { SKIP_RESPONSE_FORMAT_KEY } from '@common/decorators/skip.response.format.decorator';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Applies the standard success envelope unless {@link SkipResponseFormat} is set. */
@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip =
      this.reflector.get<boolean>(
        SKIP_RESPONSE_FORMAT_KEY,
        context.getHandler(),
      ) ??
      this.reflector.get<boolean>(SKIP_RESPONSE_FORMAT_KEY, context.getClass());

    if (skip) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data: any) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'totalPages' in data
        ) {
          const rawPage = request.query?.page;
          const rawPerPage = request.query?.per_page;
          const page = Math.max(1, parseInt(String(rawPage), 10) || 1);
          const perPage = Math.min(
            100,
            Math.max(1, parseInt(String(rawPerPage), 10) || 10),
          );

          return {
            success: true,
            status: true,
            error: false,
            data: {
              data: data.data,
              pagination: {
                page,
                perPage,
                total: Number(data.totalPages),
              },
            },
          };
        }

        return {
          success: true,
          status: true,
          error: false,
          data,
        };
      }),
    );
  }
}
