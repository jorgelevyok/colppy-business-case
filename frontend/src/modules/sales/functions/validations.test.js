import { describe, expect, it } from 'vitest';
import { validator } from '../../../hooks/useValidator';
import { saleFormValidations } from './validations';

describe('saleFormValidations', () => {
  const run = (form) => {
    const defs = saleFormValidations(form);
    const withSetters = Object.fromEntries(
      Object.entries(defs).map(([key, field]) => [
        key,
        { ...field, setMessage: () => {} },
      ]),
    );
    return validator(withSetters, 'input');
  };

  it('passes with a complete valid form', () => {
    expect(
      run({
        sale_date: '2024-01-15',
        customer_name: 'Acme',
        product_name: 'Widget',
        payment_method_id: 1,
        sale_quantity: 2,
        unit_price: '10.50',
      }),
    ).toBe(true);
  });

  it('fails when required fields are empty', () => {
    expect(
      run({
        sale_date: '',
        customer_name: '  ',
        product_name: '',
        payment_method_id: '',
        sale_quantity: '',
        unit_price: '',
      }),
    ).toBe(false);
  });

  it('fails when quantity is zero', () => {
    expect(
      run({
        sale_date: '2024-01-15',
        customer_name: 'Acme',
        product_name: 'Widget',
        payment_method_id: 1,
        sale_quantity: 0,
        unit_price: '10',
      }),
    ).toBe(false);
  });
});
