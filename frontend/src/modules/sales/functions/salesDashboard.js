/**
 * Pure helpers for the sales dashboard modal: daily aggregates and day comparison.
 */
import { formatSaleDate } from './saleFormatters';

/** Maximum bar height in pixels for the dashboard chart. */
export const CHART_BAR_MAX_PX = 80;
/** Default number of days shown in the bar chart series. */
export const DASHBOARD_LAST_DAYS = 5;

const toAmount = (row) => {
  const value = Number(row?.sale_amount ?? 0);
  return Number.isFinite(value) ? value : 0;
};

/** Normalizes a sale date to YYYY-MM-DD for grouping. */
export const toDateKey = (date) => {
  if (!date) return null;
  const raw = String(date).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const year = parsed.getUTCFullYear();
  return `${year}-${month}-${day}`;
};

/** Short label DD/MM/YYYY for chart axis from a date key. */
export const formatDayLabel = (dateKey) => {
  const raw = String(dateKey || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return formatSaleDate(dateKey);
  const [year, month, day] = raw.split('-');
  return `${day}/${month}/${year}`;
};

const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const enrichDay = (item, maxTotal) => {
  const ratio = maxTotal > 0 ? item.total / maxTotal : 0;
  return {
    ...item,
    label: formatDayLabel(item.dateKey),
    fullLabel: formatSaleDate(item.dateKey),
    heightPx:
      maxTotal > 0 ? Math.max(8, Math.round(ratio * CHART_BAR_MAX_PX)) : 0,
  };
};

const emptyDay = (dateKey) => ({
  dateKey,
  total: 0,
  count: 0,
});

/**
 * Groups sale amounts by day, builds last-N-day series, totals, and day picker options.
 * @param {object[]} rows - Sale rows (same shape as table-back).
 * @param {object} [options] - lastDays
 */
export const buildSalesDashboardData = (
  rows = [],
  { lastDays = DASHBOARD_LAST_DAYS } = {},
) => {
  const byDay = new Map();

  for (const row of rows) {
    const key = toDateKey(row?.sale_date);
    if (!key) continue;
    const prev = byDay.get(key) || emptyDay(key);
    prev.total += toAmount(row);
    prev.count += 1;
    byDay.set(key, prev);
  }

  const allDays = Array.from(byDay.values()).sort((a, b) =>
    a.dateKey.localeCompare(b.dateKey),
  );

  const latestKey =
    allDays.length > 0
      ? allDays[allDays.length - 1].dateKey
      : toDateKey(new Date());

  const seriesRaw = [];
  for (let offset = 0; offset < lastDays; offset += 1) {
    const key = shiftDateKey(latestKey, -offset);
    seriesRaw.push(byDay.get(key) || emptyDay(key));
  }

  const maxTotal = seriesRaw.reduce((max, item) => Math.max(max, item.total), 0);
  const series = seriesRaw.map((item) => enrichDay(item, maxTotal));

  const totalAmount = rows.reduce((sum, row) => sum + toAmount(row), 0);
  const salesCount = rows.length;
  const averageTicket = salesCount ? totalAmount / salesCount : 0;

  const dayOptions = allDays.map((item) => ({
    value: item.dateKey,
    label: formatDayLabel(item.dateKey),
  }));

  return {
    series,
    dayLookup: Object.fromEntries(allDays.map((item) => [item.dateKey, item])),
    dayOptions,
    totalAmount,
    salesCount,
    averageTicket,
    maxTotal,
    latestKey,
    lastDays,
  };
};

/**
 * Compares two day aggregates: amount/count deltas and percent change.
 * @param {object|null} dayA
 * @param {object|null} dayB
 */
export const compareSalesDays = (dayA, dayB) => {
  const a = dayA || { total: 0, count: 0, dateKey: null };
  const b = dayB || { total: 0, count: 0, dateKey: null };

  const amountDiff = b.total - a.total;
  const countDiff = b.count - a.count;
  const amountPct =
    a.total === 0
      ? b.total > 0
        ? 100
        : 0
      : (amountDiff / a.total) * 100;

  return {
    dayA: a,
    dayB: b,
    amountDiff,
    countDiff,
    amountPct,
  };
};
