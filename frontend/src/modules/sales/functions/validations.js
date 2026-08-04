/**
 * Validation rule definitions for the new/edit sale form (used with useValidator).
 */
const toFiniteNumberOrEmpty = (value) => {
  if (value === '' || value == null) return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
};

/**
 * @param {object} form - Current form state
 * @returns {object} Field configs with value and rules arrays
 */
export function saleFormValidations(form) {
  return {
    sale_date: {
      value: form.sale_date ?? '',
      rules: [{ required: [true, 'La fecha es obligatoria'] }],
    },
    customer_name: {
      value: (form.customer_name ?? '').trim(),
      rules: [{ required: [true, 'El cliente es obligatorio'] }],
    },
    product_name: {
      value: (form.product_name ?? '').trim(),
      rules: [{ required: [true, 'El producto es obligatorio'] }],
    },
    payment_method_id: {
      value: form.payment_method_id ?? '',
      rules: [{ required: [true, 'Seleccioná un método de pago'] }],
    },
    sale_quantity: {
      value: toFiniteNumberOrEmpty(form.sale_quantity),
      rules: [
        {
          required: [true, 'La cantidad es obligatoria'],
          greater: [0, 'La cantidad debe ser mayor a 0'],
        },
      ],
    },
    unit_price: {
      value: String(form.unit_price ?? '').trim(),
      rules: [
        {
          required: [true, 'El precio unitario es obligatorio'],
          regex: [/^\d+(\.\d+)?$/, 'El precio unitario no es válido'],
        },
      ],
    },
  };
}
