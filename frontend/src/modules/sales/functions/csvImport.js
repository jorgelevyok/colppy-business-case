/**
 * CSV import: column definitions, parsing, and client-side validation before upload.
 */
export const MAX_IMPORT_MB = 5;

/** Header names required in sales CSV (import and export). */
export const SALES_CSV_REQUIRED_COLUMNS = [
  'id_venta',
  'fecha',
  'cliente',
  'producto',
  'cantidad',
  'importe',
  'medio_pago',
];

/**
 * Parses CSV text into headers and row objects (handles quoted fields).
 * @param {string} text
 * @returns {{ headers: string[], rows: object[] }}
 */
export const parseCsvText = (text) => {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  const splitLine = (line) => {
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cells[index] ?? '';
    });
    return obj;
  });

  return { headers, rows };
};

/**
 * Validates that required columns exist and at least one data row is present.
 * @returns {{ ok: boolean, message: string|null }}
 */
export const validateSalesCsv = (headers, rows) => {
  const missing = SALES_CSV_REQUIRED_COLUMNS.filter((key) => !headers.includes(key));
  if (missing.length) {
    return { ok: false, message: `Faltan columnas: ${missing.join(', ')}` };
  }
  if (!rows.length) {
    return { ok: false, message: 'El archivo no tiene filas de datos' };
  }
  return { ok: true, message: null };
};
