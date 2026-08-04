/** Display helpers for sales: dates, currency-related math, file labels. */
export const formatSaleDate = (date) => {
  if (!date) return "-";

  const raw = String(date).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return `${day}-${month}-${year}`;
  }

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const year = parsed.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

/** Unit price derived from line total and quantity. */
export const getUnitPrice = (row) => {
  const total = Number(row?.sale_amount ?? 0);
  const qty = Number(row?.sale_quantity ?? 0);
  if (!qty) return total;
  return total / qty;
};

/** Capitalizes payment method name for select labels. */
export const formatPaymentMethodLabel = (name) => {
  const value = String(name || "").trim();
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/** quantity × unitPrice for the new sale form total preview. */
export const calcEstimatedTotal = (quantity, unitPrice) => {
  const qty = Number(quantity || 0);
  const price = Number(unitPrice || 0);
  if (!Number.isFinite(qty) || !Number.isFinite(price)) return 0;
  return qty * price;
};

/** Human-readable file name and size for CSV import preview. */
export const formatFilePreviewLabel = (file) => {
  if (!file) return null;
  return `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
};
