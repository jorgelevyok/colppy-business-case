import { describe, expect, it } from 'vitest';
import { makeFiltersQuery } from './filtersTableBack';

describe('makeFiltersQuery', () => {
  it('returns empty object JSON when there are no filters', () => {
    expect(makeFiltersQuery()).toBe('{}');
  });

  it('serializes AND filters with string condition', () => {
    const query = makeFiltersQuery({
      customer: {
        back_attribute: 'customer.customer_name',
        condition: 'contains',
        value: 'Acme',
        type: 'string',
      },
    });

    expect(JSON.parse(query)).toEqual({
      AND: [{ 'customer.customer_name': { contains: 'Acme' } }],
    });
  });

  it('adds SEARCH block when searchTerm is provided', () => {
    const query = makeFiltersQuery(
      {},
      {
        name: {
          back_attribute: 'customer.customer_name',
          type: 'string',
        },
      },
      'Acme',
    );

    const parsed = JSON.parse(query);
    expect(parsed.AND).toHaveLength(1);
    expect(parsed.AND[0].AND[0].OR[0]).toEqual({
      'customer.customer_name': { contains: 'Acme' },
    });
  });
});
