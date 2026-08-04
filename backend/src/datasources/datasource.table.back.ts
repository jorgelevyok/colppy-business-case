/**
 * TableBack query engine: translates frontend grid query params into TypeORM
 * WHERE/ORDER BY/LIMIT clauses (filters, search, soft deletes, pagination).
 */
import { QueryParamsDTO } from '@common/dto/common.dto';
import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm';

type Where = Record<string, any>;

enum Operator {
  OR = 'OR',
  AND = 'AND',
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/** Parses `filters` from JSON string or object; returns undefined when invalid. */
const parseTableBackFilters = (
  filters: QueryParamsDTO['filters'],
): Where | undefined => {
  if (filters == null || filters === '') return undefined;
  if (typeof filters === 'object') return filters as Where;
  try {
    const decoded = safeDecodeURIComponent(String(filters));
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? (parsed as Where) : undefined;
  } catch {
    return undefined;
  }
};

const hasTableBackFilterConditions = (where: Where): boolean => {
  for (const key of Object.keys(where)) {
    if (key === Operator.OR || key === Operator.AND) {
      const conditions = where[key];
      if (!Array.isArray(conditions)) continue;
      if (
        conditions.some(
          (condition) =>
            condition &&
            typeof condition === 'object' &&
            hasTableBackFilterConditions(condition as Where),
        )
      ) {
        return true;
      }
      continue;
    }

    const operations = where[key];
    if (
      operations &&
      typeof operations === 'object' &&
      Object.keys(operations).length > 0
    ) {
      return true;
    }
  }

  return false;
};

/** True when the query includes at least one filter condition. */
export const hasTableBackFilters = (query: QueryParamsDTO): boolean => {
  const parsed = parseTableBackFilters(query.filters);
  if (!parsed || Object.keys(parsed).length === 0) return false;
  return hasTableBackFilterConditions(parsed);
};

const hasTableBackFilterOnAttribute = (
  where: Where,
  attribute: string,
): boolean => {
  for (const key of Object.keys(where)) {
    if (key === Operator.OR || key === Operator.AND) {
      const conditions = where[key];
      if (!Array.isArray(conditions)) continue;
      if (
        conditions.some(
          (condition) =>
            condition &&
            typeof condition === 'object' &&
            hasTableBackFilterOnAttribute(condition as Where, attribute),
        )
      ) {
        return true;
      }
      continue;
    }

    if (key === attribute) {
      const operations = where[key];
      if (
        operations &&
        typeof operations === 'object' &&
        Object.keys(operations).length > 0
      ) {
        return true;
      }
    }
  }

  return false;
};

/** True when filters explicitly target a given SQL field/expression name. */
export const tableBackFiltersIncludeAttribute = (
  query: QueryParamsDTO,
  attribute: string,
): boolean => {
  const parsed = parseTableBackFilters(query.filters);
  if (!parsed) return false;
  return hasTableBackFilterOnAttribute(parsed, attribute);
};

/** Stateful helper built from {@link QueryParamsDTO} to apply grid semantics to a query builder. */
export class TableBack {
  private count = 0;
  private readonly filters?: Where;
  private readonly pagination?: boolean;
  private readonly page?: number;
  private readonly per_page?: number;
  private readonly order?: ('ASC' | 'DESC')[];
  private readonly order_by?: string[];
  private readonly deleted: 'exclude' | 'include' | 'only';
  private readonly search_field?: string;
  private readonly search_value?: string;
  private readonly add_attribute?: string[] | string;

  constructor(query: QueryParamsDTO) {
    this.filters = parseTableBackFilters(query.filters);
    this.pagination = query.pagination;
    this.page = query.page;
    this.per_page = query.per_page;
    this.order =
      this.safeParseJson(query.order, (v) =>
        Array.isArray(v) ? v : undefined,
      ) ?? undefined;
    this.order_by =
      this.safeParseJson(query.order_by, (v) =>
        Array.isArray(v) ? v : undefined,
      ) ?? undefined;
    this.deleted = query.deleted as 'exclude' | 'include' | 'only';
    this.search_field = query.search_field;
    this.search_value = query.search_value;
    this.add_attribute = query.add_attribute;
  }

  private safeParseJson<T>(
    value: unknown,
    parse: (parsed: unknown) => T | undefined,
  ): T | undefined {
    if (value == null) return undefined;
    if (typeof value !== 'string') return parse(value);
    try {
      return parse(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  /**
   * Applies filters, search, deleted mode, ordering, optional pagination/count, and executes the query.
   * @returns `{ rows, count }` where count is set when pagination is enabled.
   */
  async filterQuery<T>(query: SelectQueryBuilder<T>) {
    if (this.filters) {
      query.andWhere(
        new Brackets((qb) => {
          this.traverseTree(qb, this.filters, Operator.AND, query);
        }),
      );
    }

    if (this.search_field && this.search_value) {
      const fields = this.search_field.split(',').map((field) => field.trim());
      const paramName = `param${this.count++}`;

      query.andWhere(
        new Brackets((qb) => {
          fields.forEach((field, index) => {
            const param = `${paramName}_${index}`;
            qb.orWhere(`${field} ILIKE :${param}`, {
              [param]: `%${this.search_value}%`,
            });
          });
        }),
      );
    }

    this.applyDeletedFilter(query);
    this.applyOrdering(query);

    if (this.pagination) {
      this.applyPagination(query);
      this.count = await query.getCount();
    }

    const data = await query.getMany();

    return { rows: data, count: this.count };
  }

  /** Applies exclude/include/only semantics for TypeORM soft-delete columns. */
  private applyDeletedFilter<T>(query: SelectQueryBuilder<T>) {
    const deleteDateColumn =
      query.expressionMap.mainAlias?.metadata?.deleteDateColumn;
    if (deleteDateColumn) {
      const deletedAtColumnName =
        deleteDateColumn.databaseName || deleteDateColumn.propertyName;
      switch (this.deleted) {
        case 'exclude':
          query.andWhere(`${query.alias}.${deletedAtColumnName} IS NULL`);
          break;
        case 'only':
          query.andWhere(`${query.alias}.${deletedAtColumnName} IS NOT NULL`);
          break;
        default:
          break;
      }
    }
  }

  private applyOrdering<T>(query: SelectQueryBuilder<T>) {
    if (this.order_by && this.order_by.length > 0) {
      const orderDirection = this.order || ['DESC'];
      this.order_by.forEach((field, index) => {
        const direction: 'ASC' | 'DESC' = (orderDirection[index] || 'ASC') as
          | 'ASC'
          | 'DESC';
        query.addOrderBy(field, direction);
      });
    } else {
      const primaryColumn =
        query.expressionMap.mainAlias?.metadata?.primaryColumns[0]
          ?.propertyName;
      if (primaryColumn) {
        query.addOrderBy(`${query.alias}.${primaryColumn}`, 'DESC');
      }
    }
  }

  /** Walks nested AND/OR filter trees from the frontend grid. */
  private traverseTree(
    query: WhereExpressionBuilder,
    where: Where,
    upperOperator = Operator.AND,
    selectQueryBuilder?: SelectQueryBuilder<any>,
  ) {
    Object.keys(where).forEach((key) => {
      if (key === Operator.OR) {
        query.orWhere(
          new Brackets((qb) => {
            where[Operator.OR].forEach((condition: Where) =>
              this.traverseTree(qb, condition, Operator.OR, selectQueryBuilder),
            );
          }),
        );
      } else if (key === Operator.AND) {
        query.andWhere(
          new Brackets((qb) => {
            where[Operator.AND].forEach((condition: Where) =>
              this.traverseTree(
                qb,
                condition,
                Operator.AND,
                selectQueryBuilder,
              ),
            );
          }),
        );
      } else {
        query = this.handleArgs(
          query,
          { [key]: where[key] },
          upperOperator === Operator.AND ? 'andWhere' : 'orWhere',
          selectQueryBuilder,
        );
      }
    });

    return query;
  }

  /** Maps field/operation/value triples to SQL fragments via {@link applyNormalFilter}. */
  private handleArgs(
    query: WhereExpressionBuilder,
    where: Where,
    andOr: 'andWhere' | 'orWhere',
    selectQueryBuilder?: SelectQueryBuilder<any>,
  ) {
    Object.entries(where).forEach(([fieldName, filters]) => {
      Object.entries(filters as Record<string, any>).forEach(
        ([operation, value]) => {
          const paramName = `param${this.count++}`;
          this.applyNormalFilter(
            query,
            fieldName,
            operation,
            value,
            paramName,
            andOr,
          );
        },
      );
    });

    return query;
  }

  /** Implements TableBack filter operators (is, contains, in, comparisons, etc.). */
  private applyNormalFilter(
    query: WhereExpressionBuilder,
    fieldName: string,
    operation: string,
    value: any,
    paramName: string,
    andOr: 'andWhere' | 'orWhere',
  ) {
    switch (operation) {
      case 'is': {
        query[andOr](`${fieldName} = :${paramName}`, { [paramName]: value });
        break;
      }
      case 'not': {
        query[andOr](`${fieldName} != :${paramName}`, { [paramName]: value });
        break;
      }
      case 'is_null': {
        query[andOr](`${fieldName} IS NULL`);
        break;
      }
      case 'not_null': {
        query[andOr](`${fieldName} IS NOT NULL`);
        break;
      }
      case 'is_empty': {
        if (value) {
          query[andOr](`${fieldName} IS NULL`);
        } else {
          query[andOr](`${fieldName} IS NOT NULL`);
        }
        break;
      }
      case 'in': {
        query[andOr](`${fieldName} IN (:...${paramName})`, {
          [paramName]: value,
        });
        break;
      }
      case 'not_in': {
        query[andOr](`${fieldName} NOT IN (:...${paramName})`, {
          [paramName]: value,
        });
        break;
      }
      case 'lt': {
        query[andOr](`${fieldName} < :${paramName}`, { [paramName]: value });
        break;
      }
      case 'lte': {
        query[andOr](`${fieldName} <= :${paramName}`, { [paramName]: value });
        break;
      }
      case 'gt': {
        query[andOr](`${fieldName} > :${paramName}`, { [paramName]: value });
        break;
      }
      case 'gte': {
        query[andOr](`${fieldName} >= :${paramName}`, { [paramName]: value });
        break;
      }
      case 'contains': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text ILIKE :${paramName}`, {
          [paramName]: `%${searchValue}%`,
        });
        break;
      }
      case 'not_contains': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text NOT ILIKE :${paramName}`, {
          [paramName]: `%${searchValue}%`,
        });
        break;
      }
      case 'starts_with': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text ILIKE :${paramName}`, {
          [paramName]: `${searchValue}%`,
        });
        break;
      }
      case 'not_starts_with': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text NOT ILIKE :${paramName}`, {
          [paramName]: `${searchValue}%`,
        });
        break;
      }
      case 'ends_with': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text ILIKE :${paramName}`, {
          [paramName]: `%${searchValue}`,
        });
        break;
      }
      case 'not_ends_with': {
        const searchValue = String(value);
        query[andOr](`${fieldName}::text NOT ILIKE :${paramName}`, {
          [paramName]: `%${searchValue}`,
        });
        break;
      }
      case 'similar_to': {
        query[andOr](`similarity(${fieldName}, :${paramName}) > 0.3`, {
          [paramName]: value,
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  private applyPagination<T>(query: SelectQueryBuilder<T>) {
    const offset = ((this.page ?? 1) - 1) * (this.per_page ?? 10);
    query.take(this.per_page ?? 10).skip(offset);
  }

  /** Extra SELECT fragments requested via `add_attribute` query param. */
  getAddAttribute(): string[] {
    if (!this.add_attribute) return [];

    if (typeof this.add_attribute === 'string') {
      return this.add_attribute
        .split(',')
        .map((attr) => attr.trim())
        .filter((attr) => attr.length > 0);
    }

    return this.add_attribute;
  }
}
