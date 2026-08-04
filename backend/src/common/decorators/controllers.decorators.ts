/**
 * Swagger decorators documenting TableBack query parameters on grid endpoints.
 */
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/** Documents filters, pagination, ordering, and add_attribute for OpenAPI. */
export function ApiTableBackQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'filters',
      required: false,
      description:
        "JSON filter tree with combinable 'AND' and 'OR' groups. " +
        'Example: {"AND": [ { "name": { "contains": "example" }}, {"email": {"contains": "@email.com"}} ]}',
    }),
    ApiQuery({
      name: 'deleted',
      required: false,
      type: 'string',
      enum: ['only', 'include'],
    }),
    ApiQuery({
      name: 'order',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          example: 'asc',
        },
        minItems: 1,
      },
      style: 'form',
      explode: false,
    }),
    ApiQuery({
      name: 'order_by',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 1,
      },
      style: 'form',
      explode: false,
    }),
    ApiQuery({
      name: 'pagination',
      required: false,
      type: 'boolean',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: 'integer',
    }),
    ApiQuery({
      name: 'per_page',
      required: false,
      type: 'integer',
    }),
    ApiQuery({
      name: 'add_attribute',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 1,
      },
      style: 'form',
      explode: true,
    }),
  );
}
