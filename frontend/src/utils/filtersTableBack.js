/**
 * Encodes TableBack filter UI state into the JSON query string expected by table-back APIs.
 */
export const conditionsLabels = {
  is: 'Es igual',
  contains: 'Contiene',
  gt: 'Mayor a',
  lt: 'Menor a',
};

/** Builds searchable hidden filter entries from a filters config object. */
export const buildSearchBaseFromFiltersConfig = (filters) => {
  if (!filters || typeof filters !== 'object') return {};
  const search = {};
  for (const key in filters) {
    const filter = filters[key];
    if (filter?.searcheable) {
      let backAttribute = filter.search_back_attribute ?? filter.back_attribute;
      if (
        !filter.search_back_attribute &&
        backAttribute &&
        (backAttribute.includes("company_custom_fields->>'") ||
          backAttribute.includes("contact_custom_fields->>'"))
      ) {
        const uuidMatch = backAttribute.match(
          /'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/i
        );
        if (uuidMatch?.[1]) backAttribute = uuidMatch[1];
      }
      search[key] = {
        back_attribute: backAttribute,
        value: '',
        hidden: true,
        type: filter.type,
      };
    }
  }
  return search;
};

/**
 * Serializes applied filters and global search into the JSON string for ?filters= query param.
 */
export const makeFiltersQuery = (filters = {}, search = {}, searchTerm = '') => {
  const filters_OR = [];
  const filters_AND = [];
  const filters_SEARCH = [];

  for (const key in filters) {
    const filter = filters[key];
    const formattedFilter = formatFiltersForBackend(filter);
    if (formattedFilter == null) {
      continue;
    }
    if (filter.operator === 'OR') {
      filters_OR.push(formattedFilter);
    } else {
      filters_AND.push(formattedFilter);
    }
  }

  if (searchTerm) {
    for (const key in search) {
      const searchFilter = search[key];
      searchFilter.value = searchTerm;
      if (!searchFilter.condition) {
        searchFilter.condition = searchFilter.type === 'string' ? 'contains' : 'is';
      }
      const formattedSearchFilter = formatSearchFiltersForBackend(searchFilter);
      if (formattedSearchFilter) {
        filters_SEARCH.push(formattedSearchFilter);
      }
    }
  }

  const base_query = {};
  if (filters_AND.length > 0) base_query.AND = filters_AND;
  if (filters_OR.length > 0) base_query.OR = filters_OR;
  if (filters_SEARCH.length > 0) {
    const search_obj = { AND: [{ OR: filters_SEARCH }] };
    if (base_query.AND) {
      base_query.AND = [...base_query.AND, search_obj];
    } else {
      base_query.AND = [search_obj];
    }
  }

  return JSON.stringify(base_query);
};

function formatFiltersForBackend(filter) {
  if (filter && filter.custom_nested) return filter.custom_nested;
  const condition = filter.condition;
  const value = filter.value;
  let attribute = filter.back_attribute;

  if (attribute && (attribute.includes("contact_custom_fields->>'") || attribute.includes("company_custom_fields->>'"))) {
    const uuidMatch = attribute.match(/'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/i);
    if (uuidMatch && uuidMatch[1]) attribute = uuidMatch[1];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const obj = {};
    obj[attribute] = {};
    obj[attribute].in = value;
    return obj;
  }

  if (filter.type === 'date-range') {
    if (!value || (!value.from && !value.to)) {
      return null;
    }
    const obj = {};
    obj[attribute] = {};
    if (value.from) {
      obj[attribute].gte = value.from;
      if (!value.to) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        obj[attribute].lte = tomorrow.toISOString().split('T')[0];
      }
    }
    if (value.to) {
      const dateTo = new Date(value.to);
      dateTo.setDate(dateTo.getDate() + 1);
      obj[attribute].lte = dateTo.toISOString().split('T')[0];
    }
    return obj;
  }

  const obj = {};
  obj[attribute] = {};
  obj[attribute][condition] = value;
  return obj;
}

function formatSearchFiltersForBackend(filter) {
  const condition = filter.condition;
  const value = filter.value;
  const attribute = filter.back_attribute;
  let obj;
  if (filter.type === 'string') {
    obj = {};
    obj[attribute] = {};
    obj[attribute][condition] = value;
  }
  if (filter.type === 'number' && Number(value)) {
    obj = {};
    obj[attribute] = {};
    obj[attribute][condition] = Number(value);
  }
  return obj;
}

/** Preset filter config for "disabled only" switch chips. */
export const getFilterDisabled = (back_attribute, label = 'Deshabilitados') => {
  const hasDeletedAt = back_attribute.includes('deleted_at');
  return {
    back_attribute,
    default_value: true,
    condition: hasDeletedAt ? 'is_null' : 'is',
    label,
    type: hasDeletedAt ? 'nulleable' : 'custom',
    component: 'switch',
    getChipHidden: (filter) => filter.value,
    getChipText: () => 'Solo deshabilitados',
  };
};

/** Preset filter for active/inactive boolean status. */
export const getFilterActiveStatus = (back_attribute, label = 'Estado') => ({
  back_attribute,
  label,
  type: 'boolean',
  condition: 'is',
  component: 'active_status',
  getChipHidden: (filter) => filter?.value === undefined || filter?.value === null,
  getChipText: (filter) =>
    filter?.value === true || filter?.value === 'true' ? 'Solo activos' : 'Solo inactivos',
});

/** Switch-style active status filter with optional default and chip behavior. */
export const getFilterActiveStatusSwitch = (back_attribute, label = 'Status', options = {}) => {
  const { default_value: defaultValue, inactiveWhenOff = false } = options;
  const resetValue = defaultValue !== undefined ? defaultValue : true;

  return {
    back_attribute,
    label,
    type: 'boolean',
    condition: 'is',
    component: 'active_status_switch',
    inactiveWhenOff,
    ...(defaultValue !== undefined ? { default_value: defaultValue } : {}),
    getChipHidden: inactiveWhenOff
      ? (filter) => filter?.value === true || filter?.value === 'true'
      : (filter) => filter?.value !== true,
    getChipText: inactiveWhenOff
      ? (filter) =>
          filter?.value === true || filter?.value === 'true' ? 'Solo activos' : 'Solo inactivos'
      : () => 'Solo activos',
    ...(inactiveWhenOff
      ? {
          getChipItems: (filter, setAppliedFilters, filterKey) => [
            {
              id: 'active-status',
              text: 'Solo inactivos',
              onRemove: () =>
                setAppliedFilters((prev) => ({
                  ...prev,
                  [filterKey]: {
                    value: resetValue,
                    condition: 'is',
                    back_attribute,
                    type: 'boolean',
                  },
                })),
            },
          ],
        }
      : {}),
  };
};
