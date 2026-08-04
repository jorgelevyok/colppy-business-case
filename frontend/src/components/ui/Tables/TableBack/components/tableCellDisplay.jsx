/** Formats cell values (strings, booleans, React nodes) for table display. */
import { isValidElement } from 'react';
import { Check, Close } from '../../../../../icons';

function displayFromRenderable(v) {
  if (v === null || v === undefined || v === '') {
    return { isEmpty: true, isBoolean: false, node: '-' };
  }
  if (typeof v === 'boolean') {
    return {
      isEmpty: false,
      isBoolean: true,
      node: v ? (
        <span className="inline-flex items-center justify-center" aria-label="Sí">
          <Check width={18} height={18} />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center" aria-label="No">
          <Close width={18} height={18} />
        </span>
      ),
    };
  }
  if (isValidElement(v)) {
    return { isEmpty: false, isBoolean: false, node: v };
  }
  return { isEmpty: false, isBoolean: false, node: String(v) };
}

function getColumnIcon(column, value, row) {
  const iconWhen = column?.iconWhen;
  const shouldShowIcon =
    typeof iconWhen === 'function'
      ? iconWhen(value, row)
      : iconWhen !== undefined
        ? value === iconWhen
        : Boolean(value);

  if (!shouldShowIcon) {
    return column?.iconFallback ?? '-';
  }

  return typeof column.icon === 'function' ? column.icon(value, row) : column.icon;
}

/** Resolves display content for a table cell using column.getLabel or raw field value. */
export function getTableCellInner(row, column) {
  const value = column?.field != null ? row[column.field] : undefined;

  if (column?.icon !== undefined) {
    return displayFromRenderable(getColumnIcon(column, value, row));
  }

  if (typeof column?.getLabel === 'function') {
    return displayFromRenderable(column.getLabel(value, row));
  }

  return displayFromRenderable(value);
}
