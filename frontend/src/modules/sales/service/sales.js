/**
 * Sales API calls: CRUD helpers, export fetch, payment methods, and CSV importer payload.
 */
import { query } from '../../../api';
import {
  buildSearchBaseFromFiltersConfig,
  makeFiltersQuery,
} from '../../../utils';

/**
 * Creates a sale on the backend.
 * @param {object} body - Sale payload from buildSalePayload.
 * @param {object} [options] - Passed to query.post (e.g. showErrorAlert).
 * @returns {Promise<{success: boolean, data?: *, error?: string}>}
 */
export const createSale = async (body, options = {}) => {
  return query.post('sales', body, {
    showErrorAlert: options.showErrorAlert ?? true,
  });
};

/**
 * Updates an existing sale by public id.
 * @param {string} saleIdPublic
 * @param {object} body
 * @param {object} [options]
 */
export const updateSale = async (saleIdPublic, body, options = {}) => {
  return query.put(`sales/${saleIdPublic}`, body, {
    showErrorAlert: options.showErrorAlert ?? true,
  });
};

/**
 * Fetches all sales rows for export using the same filters/search as TableBack (no pagination).
 * @param {object} params - appliedFilters, searchTerm, filtersConfig, options
 */
export const getSalesTableBackForExport = async ({
  appliedFilters = {},
  searchTerm = '',
  filtersConfig = {},
  options = {},
} = {}) => {
  const params = new URLSearchParams();
  const searchBase = buildSearchBaseFromFiltersConfig(filtersConfig);
  const filtersQuery = makeFiltersQuery(appliedFilters, searchBase, searchTerm);

  if (filtersQuery && filtersQuery !== '{}') {
    params.set('filters', filtersQuery);
  }

  const qs = params.toString();
  const url = qs ? `sales/table-back?${qs}` : 'sales/table-back';

  return query.get(url, {
    showErrorAlert: options.showErrorAlert ?? false,
  });
};
