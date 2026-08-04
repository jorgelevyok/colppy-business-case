/**
 * Fetches payment methods for the sale form select.
 */
import { query } from '../../../api';

/**
 * @param {object} [options] - query options (showErrorAlert, etc.)
 */
export const getPaymentMethods = async (options = {}) => {
  return query.get('payment-methods', {
    showErrorAlert: options.showErrorAlert ?? true,
  });
};
