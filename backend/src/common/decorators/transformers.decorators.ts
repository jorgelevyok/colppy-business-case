/**
 * class-transformer helpers for query strings (booleans, numbers, comma-separated arrays).
 */
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean } from 'class-validator';

/** Coerces query string booleans (`true`/`on`, `false`/`off`) before validation. */
export function TransformStringBoolean() {
  return applyDecorators(
    Transform(({ value }) => {
      if (typeof value === 'string') {
        const normalizedValue = value.toLowerCase();
        if (['true', 'on'].includes(normalizedValue)) {
          return true;
        }
        if (['false', 'off'].includes(normalizedValue)) {
          return false;
        }
      }
      return value;
    }),
    IsBoolean(),
  );
}

/** Parses numeric query params; treats null/undefined strings as missing. */
export function TransformStringNumber() {
  return applyDecorators(
    Transform(({ value }) =>
      value == null || value === 'null' || value === 'undefined'
        ? undefined
        : Number(value),
    ),
  );
}

/** Splits comma-separated query values into a trimmed string array. */
export function TransformSplitStringArray() {
  return applyDecorators(
    Transform(({ value }) => {
      if (value == null || value === '') return [];
      const raw = Array.isArray(value) ? value : String(value);
      return (Array.isArray(raw) ? raw : raw.split(','))
        .map((val: string) => String(val).trim())
        .filter(Boolean);
    }),
    IsArray(),
  );
}
