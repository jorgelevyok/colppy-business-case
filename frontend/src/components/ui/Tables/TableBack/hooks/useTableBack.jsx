/**
 * Core state and data fetching for TableBack (pagination, filters, GET table-back service).
 */
import { useEffect, useRef, useState } from 'react';
import { query } from '../../../../../api';
import { getTableConfigCache, makeFiltersQuery, setTableConfigCache } from '../../../../../utils';

const DEFAULT_STEPS = [5, 10, 15, 30, 50];

function sanitizeCurrentPage(raw) {
  if (raw == null || Array.isArray(raw) || typeof raw === 'object') return 1;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function sanitizeRowPerPage(raw, fallback = 10) {
  if (raw == null || Array.isArray(raw) || typeof raw === 'object') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

function sanitizeStepsRowsPerPage(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_STEPS];
  const nums = raw.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n >= 1);
  return nums.length > 0 ? nums : [...DEFAULT_STEPS];
}

/**
 * @param {object[]} columns - Column definitions
 * @param {object} config - TableBack config (service path, paginator, localRevision, …)
 * @param {object} [filters] - Filter schema from feature module
 */
export const useTableBack = (columns, config, filters = []) => {
  const cache = config?.local_storage_key ? getTableConfigCache(config.local_storage_key) : null;
  const lastRequestIdRef = useRef(0);
  const abortRef = useRef(null);

  const getDefaulFilters = () => {
    if (!filters || typeof filters !== 'object') return null;
    const defaultFilters = {};
    for (const key in filters) {
      const filter = filters[key];
      if (filter?.default_value !== undefined) {
        defaultFilters[key] = {
          condition: filter.condition,
          back_attribute: filter.back_attribute,
          value: filter.default_value,
        };
      }
    }
    return Object.keys(defaultFilters).length > 0 ? defaultFilters : null;
  };

  const [appliedFilters, setAppliedFilters] = useState(() => {
    const defaults = getDefaulFilters() ?? {};
    const fromCache = cache?.appliedFilters ?? {};
    return { ...defaults, ...fromCache };
  });

  const [rows, setRows] = useState([]);
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const defaultRowsPerPage = config?.paginator?.rows_per_page ?? 10;

  const [rowPerPage, setRowPerPage] = useState(() =>
    sanitizeRowPerPage(cache?.rowPerPage ?? defaultRowsPerPage, defaultRowsPerPage)
  );
  const [currentPage, setCurrentPage] = useState(() => sanitizeCurrentPage(cache?.currentPage ?? 1));
  const [stepsRowsPerPage, setStepsRowsPerPage] = useState(() =>
    sanitizeStepsRowsPerPage(cache?.stepsRowsPerPage ?? config?.paginator?.steps_rows_per_page)
  );

  const addFilter = (key_identifier, filter) => {
    setAppliedFilters((prev) => {
      const prevFilter = prev[key_identifier];
      if (prevFilter) return { ...prev, [key_identifier]: { ...prevFilter, ...filter } };
      return { ...prev, [key_identifier]: filter };
    });
  };
  const removeFilter = (key_identifier) => {
    setAppliedFilters((prev) => {
      const { [key_identifier]: _, ...rest } = prev;
      return rest;
    });
  };
  const cleanAllFilters = (force = false) => {
    setAppliedFilters(force ? {} : (getDefaulFilters() ?? {}));
  };

  const [searchTerm, setSearchTerm] = useState(cache?.searchTerm ?? '');

  const makeFiltersSearch = () => {
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
          value: searchTerm,
          hidden: true,
          type: filter.type,
        };
      }
    }
    return search;
  };
  const searchBaseFilters = makeFiltersSearch();

  const getData = async () => {
    const requestId = ++lastRequestIdRef.current;
    setIsLoading(true);
    const pageNum = sanitizeCurrentPage(currentPage);
    const perPageNum = sanitizeRowPerPage(rowPerPage, defaultRowsPerPage);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (config?.dataSource === 'local' && typeof config.getLocalPage === 'function') {
        const result = await Promise.resolve(
          config.getLocalPage({
            page: pageNum,
            perPage: perPageNum,
            searchTerm,
            appliedFilters,
          })
        );
        if (requestId !== lastRequestIdRef.current) return;
        setRows(result?.rows ?? []);
        if (result?.count != null) {
          setTotalRowsCount(result.count);
        }
        return;
      }

      if (config?.service) {
        const query_params = {};

        if (config.paginator?.show) {
          query_params.pagination = 'true';
          query_params.page = String(pageNum);
          query_params.per_page = String(perPageNum);
        }
        if (config.add_attribute) {
          query_params.add_attribute = config.add_attribute.join(', ');
        }

        const filtersQuery = makeFiltersQuery(appliedFilters, searchBaseFilters, searchTerm);
        if (filtersQuery && filtersQuery !== '{}') {
          query_params.filters = filtersQuery;
        }

        const query_params_string = new URLSearchParams(query_params).toString();
        const separator = config.service.includes('?') ? '&' : '?';
        const url = query_params_string
          ? `${config.service}${separator}${query_params_string}`
          : config.service;

        const result = await query.get(url, {
          signal: controller.signal,
          showErrorAlert: false,
        });
        if (requestId !== lastRequestIdRef.current) return;
        if (result?.success) {
          setRows(result.data?.rows ?? []);
          if (result.data?.count != null) {
            setTotalRowsCount(result.data.count);
          }
        } else {
          setRows([]);
          setTotalRowsCount(0);
        }
      }
    } catch {
      if (requestId !== lastRequestIdRef.current) return;
      setRows([]);
      setTotalRowsCount(0);
    } finally {
      if (requestId === lastRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const [showCheckbox, setShowCheckbox] = useState(cache?.showCheckbox ?? !!config?.select_rows);
  const [checkedList, setcheckedList] = useState(
    cache?.checkedList ?? config?.select_rows?.checked_list ?? []
  );

  const onSelectRow = (e, row) => {
    const isChecked = e.target.checked;
    let newArray = [row];
    if (isChecked) {
      if (config?.select_rows?.multiple) {
        setcheckedList((prev) => (prev ? [...prev, row] : [row]));
        newArray = checkedList ? [...checkedList, row] : [row];
      } else {
        setcheckedList([row]);
        newArray = [row];
      }
    } else {
      const next = (checkedList ?? []).filter((r) => JSON.stringify(r) !== JSON.stringify(row));
      setcheckedList(next);
      newArray = next;
    }
    config?.select_rows?.callback?.(newArray, row, isChecked);
  };

  const [firstLoad, setfirstLoad] = useState(true);

  useEffect(() => {
    if (!firstLoad && config?.local_storage_key) {
      const columnSort = columns?.find((c) => c.sort);
      setTableConfigCache(
        config.local_storage_key,
        {
          currentPage,
          rowPerPage,
          searchTerm,
          checkedList,
          columnSort,
          appliedFilters,
          showCheckbox,
          stepsRowsPerPage,
        },
        6000
      );
    } else {
      setfirstLoad(false);
    }
  }, [
    currentPage,
    rowPerPage,
    searchTerm,
    checkedList,
    columns,
    appliedFilters,
    showCheckbox,
    stepsRowsPerPage,
  ]);

  useEffect(() => {
    getData();
    return () => abortRef.current?.abort();
  }, [rowPerPage, currentPage, appliedFilters, searchTerm, config?.localRevision]);

  return {
    totalRows: [],
    rows,
    columnsToUse: columns ?? [],
    isLoading,
    getData,
    searchTerm,
    setSearchTerm,
    totalPages: Math.ceil(totalRowsCount / (rowPerPage || 1)) || 1,
    currentPage,
    setCurrentPage,
    rowPerPage,
    setRowPerPage,
    totalRowsCount,
    stepsRowsPerPage,
    setStepsRowsPerPage,
    onSelectRow,
    checkedList,
    showCheckbox,
    setShowCheckbox,
    appliedFilters,
    setAppliedFilters,
    addFilter,
    removeFilter,
    cleanAllFilters,
  };
};
