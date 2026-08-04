/**
 * Modal to create or edit a sale. Loads payment methods and submits to POST/PUT sales.
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.setOpen
 * @param {() => void} [props.onSaved] - Called after successful save to refresh the table.
 * @param {object|null} [props.sale] - When set, form runs in edit mode.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, DateInput, Input, Modal, Select } from '../../../components';
import { useValidator } from '../../../hooks';
import { Money, Package, User } from '../../../icons';
import { formatCurrency, showToast } from '../../../utils';
import {
  buildSalePayload,
  calcEstimatedTotal,
  emptySaleForm,
  formFromSale,
  formatPaymentMethodLabel,
  mapPaymentMethodsToOptions,
  saleFormValidations,
} from '../functions';
import { createSale, getPaymentMethods, updateSale } from '../service';
import styles from './NewSaleModal.module.css';

export const NewSaleModal = ({ open, setOpen, onSaved, sale = null }) => {
  const isEdit = Boolean(sale?.sale_id_public);
  const [form, setForm] = useState(emptySaleForm);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const saleValidator = useValidator(saleFormValidations(form));

  useEffect(() => {
    if (!open) return;

    setForm(isEdit ? formFromSale(sale) : emptySaleForm());
    saleValidator.resetMessages();
    let cancelled = false;

    const loadPaymentMethods = async () => {
      setLoadingMethods(true);
      const res = await getPaymentMethods({ showErrorAlert: true });
      if (cancelled) return;

      if (res.success) {
        const rows = Array.isArray(res.data) ? res.data : [];
        setPaymentMethods(rows);
      } else {
        setPaymentMethods([]);
      }
      setLoadingMethods(false);
    };

    loadPaymentMethods();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when modal opens / sale changes
  }, [open, isEdit, sale]);

  const paymentMethodOptions = useMemo(
    () => mapPaymentMethodsToOptions(paymentMethods, formatPaymentMethodLabel),
    [paymentMethods]
  );

  const estimatedTotal = useMemo(
    () => calcEstimatedTotal(form.sale_quantity, form.unit_price),
    [form.sale_quantity, form.unit_price]
  );

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleSave = async () => {
    if (!saleValidator.validate('input')) return;

    const payload = buildSalePayload(form, estimatedTotal);

    setLoading(true);
    try {
      const res = isEdit
        ? await updateSale(sale.sale_id_public, payload)
        : await createSale(payload);

      if (!res.success) return;

      showToast('success', isEdit ? 'Venta actualizada' : 'Venta creada');
      onSaved?.(res.data);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Box className={styles.footer}>
      <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
        Cancelar
      </Button>
      <Button type="button" variant="primary" onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar venta'}
      </Button>
    </Box>
  );

  return (
    <Modal
      open={open}
      setOpen={(next) => {
        if (!next) handleClose();
        else setOpen(true);
      }}
      title={isEdit ? 'Editar venta' : 'Nueva venta'}
      subtitle={
        isEdit
          ? 'Actualizá los datos de la operación.'
          : 'Completá los datos de la operación.'
      }
      icon={<Package width={20} height={20} />}
      bottom={footer}
      contentClassName="pb-2"
      className="!max-w-[640px]"
    >
      <Box className={styles.form}>
        <Box className={styles.row}>
          <DateInput
            label="Fecha de venta"
            value={form.sale_date}
            onChange={setField('sale_date')}
            required
            validation={saleValidator.sale_date}
          />
          <Input
            label="Cliente"
            value={form.customer_name}
            onChange={setField('customer_name')}
            placeholder="Ej: Distribuidora Norte"
            leftIcon={<User width={16} height={16} />}
            required
            validation={saleValidator.customer_name}
          />
        </Box>

        <Input
          label="Producto"
          value={form.product_name}
          onChange={setField('product_name')}
          placeholder='Ej: Notebook Pro 14"'
          required
          validation={saleValidator.product_name}
        />

        <Select
          label="Método de pago"
          value={form.payment_method_id}
          onChange={setField('payment_method_id')}
          options={paymentMethodOptions}
          placeholder={loadingMethods ? 'Cargando…' : 'Seleccionar método'}
          leftIcon={<Money width={16} height={16} />}
          disabled={loadingMethods || paymentMethodOptions.length === 0}
          required
          validation={saleValidator.payment_method_id}
        />

        <Box className={styles.row}>
          <Input
            label="Cantidad"
            type="number"
            min="1"
            step="1"
            value={form.sale_quantity}
            onChange={setField('sale_quantity')}
            required
            validation={saleValidator.sale_quantity}
          />
          <Input
            label="Precio unitario"
            type="number"
            min="0"
            step="0.01"
            value={form.unit_price}
            onChange={setField('unit_price')}
            required
            validation={saleValidator.unit_price}
          />
        </Box>

        <Box className={styles.totalBox}>
          <span>Total estimado</span>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </Box>
      </Box>
    </Modal>
  );
};
