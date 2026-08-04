/**
 * Metadata key and decorator to bypass {@link ResponseFormatInterceptor} on a handler or controller.
 */
import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_FORMAT_KEY = 'skipResponseFormat';

/** When applied, handler responses are returned without the global success envelope. */
export const SkipResponseFormat = () =>
  SetMetadata(SKIP_RESPONSE_FORMAT_KEY, true);
