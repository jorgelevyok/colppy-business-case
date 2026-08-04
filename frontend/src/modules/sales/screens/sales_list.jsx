/**
 * Main sales page: paginated table, CSV import/export, dashboard, create/edit/detail modals.
 */
import { useMemo, useRef, useState } from "react";
import { Box, Button, TableBack } from "../../../components";
import { Cart, Chart, Download, Plus, Upload } from "../../../icons";
import { formatCurrency } from "../../../utils";
import {
  NewSaleModal,
  SaleDetailModal,
  SalesDashboardModal,
  SalesImporter,
} from "../components";
import {
  buildSalesTableConfig,
  exportSalesCsv,
  formatSaleDate,
  getUnitPrice,
  SALES_FILTERS,
} from "../functions";
import styles from "./sales_list.module.css";

const SALES_COLUMNS = [
  {
    field: "sale_code",
    label: "ID",
    width: 140,
    minWidth: 110,
    getLabel: (value) => value || "—",
  },
  {
    field: "sale_date",
    label: "Fecha de venta",
    width: 140,
    minWidth: 120,
    getLabel: (value) => formatSaleDate(value),
  },
  {
    field: "customer",
    label: "Cliente",
    width: 200,
    minWidth: 160,
    getLabel: (value) => value?.customer_name || "—",
  },
  {
    field: "product",
    label: "Producto",
    width: 180,
    minWidth: 140,
    getLabel: (value) => value?.product_name || "—",
  },
  {
    field: "sale_quantity",
    label: "Cant.",
    width: 80,
    minWidth: 70,
  },
  {
    field: "sale_amount",
    label: "Precio unit.",
    width: 120,
    minWidth: 100,
    getLabel: (_value, row) => formatCurrency(getUnitPrice(row)),
  },
  {
    field: "sale_amount",
    label: "Total",
    width: 120,
    minWidth: 100,
    getLabel: (value) => <strong>{formatCurrency(value)}</strong>,
  },
];

/** Sales list screen and table toolbar. */
export const SalesList = () => {
  const tableRef = useRef(null);
  const [importOpen, setImportOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [detailSale, setDetailSale] = useState(null);
  const [localRevision, setLocalRevision] = useState(0);
  const [exporting, setExporting] = useState(false);

  const refresh = () => {
    setLocalRevision((n) => n + 1);
    tableRef.current?.getData?.();
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportSalesCsv({
        appliedFilters: tableRef.current?.appliedFilters ?? {},
        searchTerm: tableRef.current?.searchTerm ?? "",
        fallbackRows: tableRef.current?.getTableData?.() ?? [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const openCreateModal = () => {
    setEditingSale(null);
    setSaleModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingSale(row);
    setSaleModalOpen(true);
  };

  const openDetailModal = (row) => {
    setDetailSale(row);
    setDetailOpen(true);
  };

  const handleModalOpenChange = (open) => {
    setSaleModalOpen(open);
    if (!open) setEditingSale(null);
  };

  const handleDetailOpenChange = (open) => {
    setDetailOpen(open);
    if (!open) setDetailSale(null);
  };

  const tableConfig = useMemo(
    () =>
      buildSalesTableConfig({
        localRevision,
        onEdit: openEditModal,
        onDetail: openDetailModal,
      }),
    [localRevision],
  );

  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.headerIcon}>
            <Cart width={18} height={18} />
          </div>
          <div>
            <h1>Ventas</h1>
            <p>Todas las operaciones registradas.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDashboardOpen(true)}
          >
            <Chart width={16} height={16} />
            Dashboard
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setImportOpen(true)}
          >
            <Upload width={16} height={16} />
            Importar CSV
          </Button>
          <Button type="button" variant="primary" onClick={openCreateModal}>
            <Plus width={16} height={16} />
            Nueva venta
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <TableBack
          ref={tableRef}
          columns={SALES_COLUMNS}
          config={tableConfig}
          filters={SALES_FILTERS}
          testId="sales-table"
          afterFilters={
            <Button
              type="button"
              variant="secondary"
              className={styles.toolBtn}
              onClick={handleExport}
              disabled={exporting}
            >
              <Download width={14} height={14} />
              {exporting ? "Exportando…" : "Exportar"}
            </Button>
          }
        />
      </section>

      <SalesImporter
        open={importOpen}
        setOpen={setImportOpen}
        onImported={refresh}
      />
      <SalesDashboardModal
        open={dashboardOpen}
        setOpen={setDashboardOpen}
        getQueryContext={() => ({
          appliedFilters: tableRef.current?.appliedFilters ?? {},
          searchTerm: tableRef.current?.searchTerm ?? "",
          fallbackRows: tableRef.current?.getTableData?.() ?? [],
        })}
      />
      <NewSaleModal
        open={saleModalOpen}
        setOpen={handleModalOpenChange}
        sale={editingSale}
        onSaved={refresh}
      />
      <SaleDetailModal
        open={detailOpen}
        setOpen={handleDetailOpenChange}
        sale={detailSale}
      />
    </Box>
  );
};
