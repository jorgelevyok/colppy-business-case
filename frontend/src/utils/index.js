/** Shared utilities barrel: toasts, table-back filters, currency, storage. */
export { showToast } from './alerts';
export {
  buildSearchBaseFromFiltersConfig,
  conditionsLabels,
  getFilterActiveStatus,
  getFilterActiveStatusSwitch,
  getFilterDisabled,
  makeFiltersQuery,
} from './filtersTableBack';
export { formatCurrency } from './formatters';
export {
  getTableConfigCache,
  removeTableConfigCache,
  setTableConfigCache,
} from './storage';
