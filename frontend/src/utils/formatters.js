/** Argentine peso currency formatting for display in tables and forms. */
export const formatCurrency = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};
