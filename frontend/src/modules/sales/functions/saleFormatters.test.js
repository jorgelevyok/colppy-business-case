import { describe, expect, it } from 'vitest';
import {
  calcEstimatedTotal,
  formatPaymentMethodLabel,
  formatSaleDate,
  getUnitPrice,
} from './saleFormatters';

describe('saleFormatters', () => {
  it('formatSaleDate formats YYYY-MM-DD as DD-MM-YYYY', () => {
    expect(formatSaleDate('2024-01-15')).toBe('15-01-2024');
    expect(formatSaleDate(null)).toBe('-');
  });

  it('getUnitPrice divides amount by quantity', () => {
    expect(getUnitPrice({ sale_amount: 100, sale_quantity: 4 })).toBe(25);
    expect(getUnitPrice({ sale_amount: 50, sale_quantity: 0 })).toBe(50);
  });

  it('formatPaymentMethodLabel capitalizes name', () => {
    expect(formatPaymentMethodLabel('efectivo')).toBe('Efectivo');
    expect(formatPaymentMethodLabel('')).toBe('—');
  });

  it('calcEstimatedTotal multiplies quantity and unit price', () => {
    expect(calcEstimatedTotal(3, 12.5)).toBe(37.5);
    expect(calcEstimatedTotal('x', 10)).toBe(0);
  });
});
