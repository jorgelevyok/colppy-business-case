/** Renders active filter chips with remove actions. */
import { useMemo } from 'react';
import { conditionsLabels } from '../../../../../utils';
import { Box } from '../../../Box';
import { Trash } from '../../../../../icons';

const chipStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 4,
  padding: '2px 8px',
  borderRadius: 4,
  backgroundColor: 'var(--color-primary-light)',
  color: 'var(--color-primary)',
  fontSize: 12,
  cursor: 'pointer',
  border: '1px solid transparent',
};

const formatChipDate = (value) => {
  if (!value) return null;
  const raw = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return String(value);
  const [y, m, d] = raw.split('-');
  return `${d}/${m}/${y}`;
};

const isDateRangeValue = (filter) => {
  const value = filter?.value;
  return (
    filter?.type === 'date-range' ||
    (value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('from' in value || 'to' in value))
  );
};

const formatChipValue = (filter) => {
  const value = filter?.value;

  if (isDateRangeValue(filter)) {
    const from = formatChipDate(value?.from);
    const to = formatChipDate(value?.to);
    if (from && to) return from === to ? from : `${from} — ${to}`;
    if (from) return `Desde ${from}`;
    if (to) return `Hasta ${to}`;
    return '—';
  }

  if (value != null && typeof value === 'object') {
    return Array.isArray(value) ? value.join(', ') : '—';
  }

  return value ?? '—';
};

const buildChipText = (filter, filterConfig, filterKey) => {
  if (filterConfig?.getChipText) return filterConfig.getChipText(filter);

  const label = filterConfig?.label || filterKey;
  const valueText = formatChipValue(filter);

  if (isDateRangeValue(filter)) {
    return `${label}: ${valueText}`;
  }

  const condition = conditionsLabels[filter.condition] || filter.condition;
  return `${label}: ${condition} - ${valueText}`;
};

export const AppliedFilters = ({ appliedFilters, setAppliedFilters, filtersConfig }) => {
  const handleRemoveFilterDisabled = () => {
    setAppliedFilters((prev) => {
      const next = { ...prev };
      if (next.filter_disabled?.back_attribute?.includes('deleted_at')) {
        next.filter_disabled = { ...next.filter_disabled, condition: 'is_null' };
      }
      if (next.filter_disabled) next.filter_disabled.value = true;
      return next;
    });
  };

  const removeFilter = (key) => {
    try {
      if (key === 'filter_disabled') {
        handleRemoveFilterDisabled();
        return;
      }
      setAppliedFilters((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const ChipFilter = ({ filter, filterConfig, filterKey }) => {
    const textToShow = buildChipText(filter, filterConfig, filterKey);
    const chipStyleCustom = filterConfig?.getChipStyle?.(filter) || {};

    return (
      <Box
        className="tableback-chip-filter"
        style={{ ...chipStyle, ...chipStyleCustom }}
        onClick={() => removeFilter(filterKey)}
      >
        {textToShow}
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Trash width={12} height={12} />
        </Box>
      </Box>
    );
  };

  const renderAppliedFilters = useMemo(() => {
    if (!filtersConfig || typeof filtersConfig !== 'object') return null;
    return Object.keys(appliedFilters).flatMap((key) => {
      const filter = appliedFilters[key];
      const filterConfig = filtersConfig[key];
      const isHidden = filterConfig?.getChipHidden?.(filter) ?? filter?.hidden ?? false;
      if (isHidden) return [];

      if (filterConfig?.getChipItems) {
        const items = filterConfig.getChipItems(
          filter,
          (updater) => setAppliedFilters(updater),
          key
        );
        if (!items?.length) return [];
        return items.map((item, index) => (
          <Box key={`${key}-${item.id ?? index}`}>
            <Box
              className="tableback-chip-filter"
              style={{ ...chipStyle, ...(item.style || {}) }}
              onClick={() => item.onRemove?.()}
            >
              {item.text}
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Trash width={12} height={12} />
              </Box>
            </Box>
          </Box>
        ));
      }

      return (
        <Box key={key}>
          <ChipFilter filter={filter} filterConfig={filterConfig} filterKey={key} />
        </Box>
      );
    });
  }, [appliedFilters, filtersConfig]);

  return (
    <Box className="w-full flex gap-2 flex-wrap pb-4 only-sm:pb-0 only-sm:pt-2">
      {renderAppliedFilters}
    </Box>
  );
};
