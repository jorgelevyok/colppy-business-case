/**
 * Builds importer API body and posts CSV rows to POST importer.
 */
import { query } from '../../../api';
import { SALES_CSV_REQUIRED_COLUMNS } from '../functions/csvImport';

/**
 * Maps parsed CSV headers/rows to the backend importer schema for entity sales.
 * @param {object} params - headers, rows, fileName, dryRun
 */
export const buildSalesImportPayload = ({
  headers,
  rows,
  fileName,
  dryRun = false,
} = {}) => {
  const columnIndex = Object.fromEntries(
    SALES_CSV_REQUIRED_COLUMNS.map((key) => [
      key,
      headers.findIndex((header) => header === key),
    ]),
  );

  const mappedRows = rows.map((row) =>
    SALES_CSV_REQUIRED_COLUMNS.map((key) => {
      const index = columnIndex[key];
      if (index < 0) return '';
      if (Array.isArray(row)) return row[index] ?? '';
      return row?.[key] ?? '';
    }),
  );

  return {
    entity: 'sales',
    columns: SALES_CSV_REQUIRED_COLUMNS.map((key) => [key, {}]),
    rows: mappedRows,
    dryRun,
    file_name: fileName || undefined,
  };
};

/** Sends import payload to POST importer. */
export const importSalesCsv = async (payload, options = {}) => {
  return query.post('importer', payload, {
    showErrorAlert: options.showErrorAlert ?? true,
  });
};
