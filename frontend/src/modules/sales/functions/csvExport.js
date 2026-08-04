/**
 * Sales CSV download: build file content, trigger browser download, and export with table filters.
 */
import { showToast } from '../../../utils';
import { getSalesTableBackForExport } from '../service/sales';
import { SALES_CSV_REQUIRED_COLUMNS } from './csvImport';
import { SALES_FILTERS } from './salesTable';

const escapeCsvCell = (value) => {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const formatExportDate = (date) => {
  if (!date) return '';
  const raw = String(date).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const year = parsed.getUTCFullYear();
  return `${year}-${month}-${day}`;
};

const mapSaleRowToCsvCells = (row) => [
  row?.sale_code ?? '',
  formatExportDate(row?.sale_date),
  row?.customer?.customer_name ?? '',
  row?.product?.product_name ?? '',
  row?.sale_quantity ?? '',
  row?.sale_amount ?? '',
  row?.payment_method?.payment_method_name ?? '',
];

/** Builds CSV string from sale row objects using SALES_CSV_REQUIRED_COLUMNS order. */
export const buildSalesCsv = (rows = []) => {
  const lines = [SALES_CSV_REQUIRED_COLUMNS.join(',')];

  for (const row of rows) {
    lines.push(mapSaleRowToCsvCells(row).map(escapeCsvCell).join(','));
  }

  return lines.join('\n');
};

/** Sample CSV with header and a few example rows for the importer UI. */
export const buildExampleSalesCsv = () => {
  const exampleRows = [
    ['V-1001', '2026-05-02', 'Comercial Andrade', 'Servicio de consultoria', '1', '18500.00', 'transferencia'],
    ['V-1002', '2026-05-04', 'Garcia SA', 'Notebook Lenovo', '2', '2469.12', 'tarjeta'],
    ['V-1003', '2026-05-05', 'Juan Perez', 'Resma A4', '10', '9900.00', 'efectivo'],
  ];

  return [
    SALES_CSV_REQUIRED_COLUMNS.join(','),
    ...exampleRows.map((cells) => cells.map(escapeCsvCell).join(',')),
  ].join('\n');
};

/**
 * Triggers a client-side CSV download (UTF-8 with BOM).
 * @param {string} filename
 * @param {string} csvContent
 * @returns {boolean}
 */
export const downloadCsvFile = (filename, csvContent) => {
  const safeName = String(filename || 'venta.csv').toLowerCase().endsWith('.csv')
    ? String(filename)
    : `${filename || 'venta'}.csv`;

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv',
  });

  if (typeof window !== 'undefined' && window.navigator?.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, safeName);
    return true;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', safeName);
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 1500);

  return true;
};

const buildExportFilename = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  return `venta_${date}.csv`;
};

/** Downloads the example/template sales CSV. */
export const downloadExampleSalesCsv = () => {
  downloadCsvFile('venta_ejemplo.csv', buildExampleSalesCsv());
};

/**
 * Exports sales matching current table filters/search via API, with fallback to loaded rows.
 * @param {object} params - appliedFilters, searchTerm, fallbackRows
 */
export const exportSalesCsv = async ({
  appliedFilters = {},
  searchTerm = '',
  fallbackRows = [],
} = {}) => {
  try {
    const result = await getSalesTableBackForExport({
      appliedFilters,
      searchTerm,
      filtersConfig: SALES_FILTERS,
    });

    let rows = result?.success ? (result.data?.rows ?? []) : [];

    if (!rows.length && Array.isArray(fallbackRows) && fallbackRows.length) {
      rows = fallbackRows;
    }

    if (!rows.length) {
      showToast('info', 'No hay datos para exportar con los filtros actuales');
      return { success: false };
    }

    downloadCsvFile(buildExportFilename(), buildSalesCsv(rows));
    showToast('success', `CSV exportado (${rows.length} filas)`);
    return { success: true, count: rows.length };
  } catch (error) {
    showToast('error', error?.message || 'No se pudo exportar el CSV');
    return { success: false };
  }
};
