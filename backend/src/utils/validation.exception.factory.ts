/**
 * ValidationPipe exception factory: flattens nested class-validator errors
 * into a single BadRequestException with constraint messages.
 */
import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/** Recursively collects leaf validation errors from nested DTO trees. */
const flattenValidationErrors = (
  errors: ValidationError[],
): ValidationError[] => {
  const result: ValidationError[] = [];
  for (const error of errors) {
    if (error.constraints) {
      result.push(error);
    }
    if (error.children?.length) {
      result.push(...flattenValidationErrors(error.children));
    }
  }
  return result;
};

/** Used by global ValidationPipe in {@link bootstrap}. */
export const validationExceptionFactory = (errors: ValidationError[]) => {
  const flatErrors = flattenValidationErrors(errors);
  const messages = flatErrors.flatMap((error) =>
    error.constraints ? Object.values(error.constraints) : [],
  );

  return new BadRequestException(messages);
};
