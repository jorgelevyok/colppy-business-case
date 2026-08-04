/**
 * New/edit sale form: default values, mapping from API row, and POST body builder.
 */
import { getUnitPrice } from './saleFormatters';

const todayInputValue = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** Converts API or Date values to yyyy-mm-dd for DateInput. */
export const toDateInputValue = (value) => {
  if (!value) return todayInputValue();
  const raw = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return todayInputValue();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
};

/** Default empty form state for creating a sale. */
export const emptySaleForm = () => ({
  sale_date: todayInputValue(),
  customer_name: '',
  product_name: '',
  sale_quantity: '1',
  unit_price: '0',
  payment_method_id: '',
});

/** Maps a table-back sale row into form field values for edit mode. */
export const formFromSale = (sale) => ({
  sale_date: toDateInputValue(sale?.sale_date),
  customer_name: sale?.customer?.customer_name || '',
  product_name: sale?.product?.product_name || '',
  sale_quantity: String(sale?.sale_quantity ?? 1),
  unit_price: String(getUnitPrice(sale) || 0),
  payment_method_id: sale?.payment_method_id
    ? String(sale.payment_method_id)
    : sale?.payment_method?.payment_method_id
      ? String(sale.payment_method.payment_method_id)
      : '',
});

/** Maps payment method entities to Select options. */
export const mapPaymentMethodsToOptions = (paymentMethods, formatLabel) =>
  (Array.isArray(paymentMethods) ? paymentMethods : []).map((method) => ({
    value: String(method.payment_method_id),
    label: formatLabel(method.payment_method_name),
  }));

/** Request body for POST/PUT sales from form state and computed line total. */
export const buildSalePayload = (form, estimatedTotal) => ({
  sale_date: form.sale_date,
  customer_name: form.customer_name.trim(),
  product_name: form.product_name.trim(),
  sale_quantity: Number(form.sale_quantity),
  sale_amount: estimatedTotal,
  payment_method_id: Number(form.payment_method_id),
});
