/**
 * Read-only modal showing a single sale row from the table (customer, product, amounts).
 */
import { Box, Button, Modal } from '../../../components';
import { Eye } from '../../../icons';
import { formatCurrency } from '../../../utils';
import { formatSaleDate, getUnitPrice } from '../functions';
import styles from './SaleDetailModal.module.css';

const DetailRow = ({ label, children }) => (
  <div className={styles.row}>
    <span className={styles.label}>{label}</span>
    <div className={styles.value}>{children}</div>
  </div>
);

/** @param {object|null} sale - Table row passed from SalesList */
export const SaleDetailModal = ({ open, setOpen, sale = null }) => {
  if (!sale) return null;

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
      title="Detalle de venta"
      subtitle={sale.sale_code || '—'}
      icon={<Eye width={20} height={20} />}
      bottom={footer}
      contentClassName="pb-2"
      className="!max-w-[520px]"
    >
      <Box className={styles.detail}>
        <DetailRow label="ID">{sale.sale_code || '—'}</DetailRow>
        <DetailRow label="Fecha de venta">{formatSaleDate(sale.sale_date)}</DetailRow>
        <DetailRow label="Cliente">
          {sale.customer?.customer_name || '—'}
        </DetailRow>
        <DetailRow label="Producto">
          {sale.product?.product_name || '—'}
        </DetailRow>
        <DetailRow label="Cantidad">{sale.sale_quantity ?? '—'}</DetailRow>
        <DetailRow label="Precio unitario">
          {formatCurrency(getUnitPrice(sale))}
        </DetailRow>
        <DetailRow label="Total">
          <strong>{formatCurrency(sale.sale_amount)}</strong>
        </DetailRow>
      </Box>
    </Modal>
  );
};
