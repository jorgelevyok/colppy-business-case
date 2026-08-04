import { describe, expect, it } from 'vitest';
import {
  buildSalesDashboardData,
  compareSalesDays,
  formatDayLabel,
  toDateKey,
} from './salesDashboard';

describe('salesDashboard', () => {
  it('toDateKey normalizes ISO dates', () => {
    expect(toDateKey('2024-01-15T12:00:00.000Z')).toBe('2024-01-15');
    expect(toDateKey(null)).toBeNull();
  });

  it('formatDayLabel formats YYYY-MM-DD as DD/MM/YYYY', () => {
    expect(formatDayLabel('2024-01-15')).toBe('15/01/2024');
  });

  it('buildSalesDashboardData aggregates totals and series', () => {
    const data = buildSalesDashboardData(
      [
        { sale_date: '2024-01-15', sale_amount: 100 },
        { sale_date: '2024-01-15', sale_amount: 50 },
        { sale_date: '2024-01-14', sale_amount: 20 },
      ],
      { lastDays: 3 },
    );

    expect(data.salesCount).toBe(3);
    expect(data.totalAmount).toBe(170);
    expect(data.averageTicket).toBeCloseTo(170 / 3);
    expect(data.latestKey).toBe('2024-01-15');
    expect(data.dayLookup['2024-01-15']).toMatchObject({
      total: 150,
      count: 2,
    });
    expect(data.series).toHaveLength(3);
  });

  it('compareSalesDays computes amount and count deltas', () => {
    const result = compareSalesDays(
      { total: 100, count: 2, dateKey: '2024-01-14' },
      { total: 150, count: 3, dateKey: '2024-01-15' },
    );

    expect(result.amountDiff).toBe(50);
    expect(result.countDiff).toBe(1);
    expect(result.amountPct).toBe(50);
  });
});
