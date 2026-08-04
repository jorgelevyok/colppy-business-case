/**
 * Normalizes importer API responses into row-level results and user messages.
 */
export const extractImportResultRows = (importResult) => {
  const data = importResult?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

/** Counts CREATED/UPDATED vs ERROR rows from importer results. */
export const countImportSummary = (resultItems = []) => {
  let created = 0;
  let errors = 0;

  resultItems.forEach((item) => {
    if (item?.status === 'ERROR') {
      errors += 1;
      return;
    }
    if (item?.status === 'CREATED' || item?.status === 'UPDATED') {
      created += 1;
    }
  });

  return {
    created,
    errors,
    total: resultItems.length,
  };
};

/** Toast-friendly summary after import (API message or derived from counts). */
export const resolveImportClientMessage = (response, summary) => {
  const fromApi =
    response?.message ||
    response?.data?.message ||
    null;

  if (fromApi && typeof fromApi === 'string' && fromApi.trim()) {
    return fromApi.trim();
  }

  if (!summary || summary.total === 0) {
    return 'No se recibieron filas para importar';
  }
  if (summary.errors === 0) {
    return `Se importaron ${summary.created} ventas correctamente`;
  }
  if (summary.created === 0) {
    return `No se importó ninguna venta. ${summary.errors} filas con error`;
  }
  return `Importación parcial: ${summary.created} importadas y ${summary.errors} con error`;
};
