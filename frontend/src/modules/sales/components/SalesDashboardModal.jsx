/**
 * Sales analytics modal: fetches filtered rows, shows KPIs, bar chart, and day comparison.
 * @param {object} props
 * @param {() => { appliedFilters, searchTerm, fallbackRows }} props.getQueryContext - Table state for API/fallback data.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Modal, Select } from '../../../components';
import { Chart } from '../../../icons';
import { formatCurrency } from '../../../utils';
import {
  buildSalesDashboardData,
  compareSalesDays,
  formatDayLabel,
  SALES_FILTERS,
} from '../functions';
import { getSalesTableBackForExport } from '../service/sales';
import styles from './SalesDashboardModal.module.css';

const compactCurrency = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return formatCurrency(0);
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return formatCurrency(n);
};

const formatSignedCurrency = (value) => {
  const n = Number(value || 0);
  const abs = formatCurrency(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${formatCurrency(Math.abs(n))}`;
  return abs;
};

const formatSignedPct = (value) => {
  const n = Number(value || 0);
  const abs = `${Math.abs(n).toFixed(1)}%`;
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
};

const trendClass = (value, stylesMap) => {
  if (value > 0) return stylesMap.up;
  if (value < 0) return stylesMap.down;
  return stylesMap.flat;
};

export const SalesDashboardModal = ({ open, setOpen, getQueryContext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(() => buildSalesDashboardData([]));
  const [dayA, setDayA] = useState('');
  const [dayB, setDayB] = useState('');
  const getQueryContextRef = useRef(getQueryContext);
  getQueryContextRef.current = getQueryContext;

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const ctx = getQueryContextRef.current?.() ?? {};
      const appliedFilters = ctx.appliedFilters ?? {};
      const searchTerm = ctx.searchTerm ?? '';
      const fallbackRows = ctx.fallbackRows ?? [];

      try {
        const result = await getSalesTableBackForExport({
          appliedFilters,
          searchTerm,
          filtersConfig: SALES_FILTERS,
        });

        let rows = result?.success ? (result.data?.rows ?? []) : [];
        if (!rows.length && Array.isArray(fallbackRows) && fallbackRows.length) {
          rows = fallbackRows;
        }

        if (!cancelled) {
          const next = buildSalesDashboardData(rows);
          setDashboard(next);

          const options = next.dayOptions;
          if (options.length >= 2) {
            setDayA(options[options.length - 2].value);
            setDayB(options[options.length - 1].value);
          } else if (options.length === 1) {
            setDayA(options[0].value);
            setDayB(options[0].value);
          } else {
            setDayA('');
            setDayB('');
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (Array.isArray(fallbackRows) && fallbackRows.length) {
            const next = buildSalesDashboardData(fallbackRows);
            setDashboard(next);
            const options = next.dayOptions;
            setDayA(options[Math.max(0, options.length - 2)]?.value ?? '');
            setDayB(options[options.length - 1]?.value ?? '');
          } else {
            setError(err?.message || 'No se pudo cargar el dashboard');
            setDashboard(buildSalesDashboardData([]));
            setDayA('');
            setDayB('');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const comparison = useMemo(() => {
    if (!dayA || !dayB) return null;
    return compareSalesDays(
      dashboard.dayLookup?.[dayA] || { dateKey: dayA, total: 0, count: 0 },
      dashboard.dayLookup?.[dayB] || { dateKey: dayB, total: 0, count: 0 },
    );
  }, [dashboard.dayLookup, dayA, dayB]);

  const footer = (
    <Box className={styles.footer}>
      <Button type="button" variant="primary" onClick={() => setOpen(false)}>
        Cerrar
      </Button>
    </Box>
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="Dashboard de ventas"
      subtitle="Últimos 5 días y comparación entre fechas."
      icon={<Chart width={20} height={20} />}
      bottom={footer}
      contentClassName="pb-1"
      className="!max-w-[720px]"
    >
      <Box className={styles.body}>
        {loading ? (
          <div className={styles.loading}>Cargando métricas…</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.kpis}>
              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Total</span>
                <span className={styles.kpiValue}>
                  {formatCurrency(dashboard.totalAmount)}
                </span>
              </div>
              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Ventas</span>
                <span className={styles.kpiValue}>{dashboard.salesCount}</span>
              </div>
              <div className={styles.kpi}>
                <span className={styles.kpiLabel}>Ticket promedio</span>
                <span className={styles.kpiValue}>
                  {formatCurrency(dashboard.averageTicket)}
                </span>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Ventas por día</div>
              <div className={styles.chartHint}>
                Últimos 5 días desde la fecha más reciente con ventas.
              </div>

              {!dashboard.series.length ? (
                <div className={styles.empty}>No hay ventas para graficar.</div>
              ) : (
                <div
                  className={styles.chart}
                  role="img"
                  aria-label="Gráfico de ventas de los últimos 5 días"
                >
                  {dashboard.series.map((item) => (
                    <div
                      key={item.dateKey}
                      className={styles.barCol}
                      title={`${item.fullLabel}: ${formatCurrency(item.total)}`}
                    >
                      <span className={styles.barAmount}>
                        {compactCurrency(item.total)}
                      </span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.bar}
                          style={{ height: item.total > 0 ? `${item.heightPx}px` : '2px' }}
                        />
                      </div>
                      <span className={styles.barLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Comparar dos días</div>
              <div className={styles.chartHint}>
                Diferencia de monto y cantidad entre dos fechas.
              </div>

              {!dashboard.dayOptions?.length ? (
                <div className={styles.empty}>No hay días con ventas para comparar.</div>
              ) : (
                <>
                  <div className={styles.comparePickers}>
                    <Select
                      label="Día A"
                      value={dayA}
                      onChange={(e) => setDayA(e.target.value)}
                      options={dashboard.dayOptions}
                      placeholder="Seleccionar día"
                    />
                    <Select
                      label="Día B"
                      value={dayB}
                      onChange={(e) => setDayB(e.target.value)}
                      options={dashboard.dayOptions}
                      placeholder="Seleccionar día"
                    />
                  </div>

                  {comparison && (
                    <div className={styles.compareGrid}>
                      <div className={styles.compareDay}>
                        <span className={styles.kpiLabel}>
                          {formatDayLabel(comparison.dayA.dateKey)}
                        </span>
                        <span className={styles.kpiValue}>
                          {formatCurrency(comparison.dayA.total)}
                        </span>
                        <span className={styles.compareMeta}>
                          {comparison.dayA.count} venta
                          {comparison.dayA.count === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className={styles.compareDay}>
                        <span className={styles.kpiLabel}>
                          {formatDayLabel(comparison.dayB.dateKey)}
                        </span>
                        <span className={styles.kpiValue}>
                          {formatCurrency(comparison.dayB.total)}
                        </span>
                        <span className={styles.compareMeta}>
                          {comparison.dayB.count} venta
                          {comparison.dayB.count === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className={styles.compareResult}>
                        <span className={styles.kpiLabel}>Diferencia (B − A)</span>
                        <span
                          className={`${styles.kpiValue} ${trendClass(
                            comparison.amountDiff,
                            styles,
                          )}`}
                        >
                          {formatSignedCurrency(comparison.amountDiff)}
                        </span>
                        <span
                          className={`${styles.compareMeta} ${trendClass(
                            comparison.amountPct,
                            styles,
                          )}`}
                        >
                          {formatSignedPct(comparison.amountPct)} ·{' '}
                          {comparison.countDiff > 0 ? '+' : ''}
                          {comparison.countDiff} ventas
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Box>
    </Modal>
  );
};
