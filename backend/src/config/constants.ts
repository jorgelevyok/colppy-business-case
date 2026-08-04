/**
 * Canonical HTTP error payloads used by {@link ServiceError} and filters.
 * Messages are bilingual (es/en) for API clients and logging.
 */
export const RESPONSES = {
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: {
      es: 'Error del servidor',
      en: 'Internal server error',
    },
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: {
      es: 'No autorizado',
      en: 'Unauthorized',
    },
  },
  NOT_FOUND: {
    statusCode: 404,
    message: {
      es: 'No se encontró ningún resultado',
      en: 'No results were found',
    },
  },
  BAD_REQUEST: {
    statusCode: 400,
    message: {
      es: 'La solicitud es incorrecta o no válida',
      en: 'The request is incorrect or invalid',
    },
  },
} as const;
