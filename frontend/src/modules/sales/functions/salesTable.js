/**
 * TableBack filter definitions and config factory for the sales list.
 */
export const SALES_FILTERS = {
  customer_name: {
    label: 'Cliente',
    type: 'string',
    back_attribute: 'customer.customer_name',
    searcheable: true,
    component: 'hidden',
  },
  product_name: {
    label: 'Producto',
    type: 'string',
    back_attribute: 'product.product_name',
    searcheable: true,
    component: 'hidden',
  },
  sale_code: {
    label: 'Código',
    type: 'string',
    back_attribute: 'sales.sale_code',
    searcheable: true,
    component: 'hidden',
  },
  sale_date: {
    label: 'Fecha de venta',
    type: 'date-range',
    back_attribute: 'sales.sale_date',
  },
};

/**
 * TableBack config: endpoint, pagination, localStorage key, row actions.
 * @param {object} params - localRevision, onEdit, onDetail callbacks
 */
export const buildSalesTableConfig = ({ localRevision, onEdit, onDetail }) => ({
  local_storage_key: 'sales_table',
  service: 'sales/table-back',
  search: { show: true },
  paginator: {
    show: true,
    show_results_per_page: true,
    rows_per_page: 10,
  },
  localRevision,
  actions: [
    {
      title: 'Ver detalle',
      type: 'detail',
      callback: (row) => onDetail?.(row),
    },
    {
      title: 'Editar',
      type: 'edit',
      callback: (row) => onEdit?.(row),
    },
  ],
});
