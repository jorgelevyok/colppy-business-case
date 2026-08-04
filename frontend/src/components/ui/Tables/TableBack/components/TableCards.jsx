/** Card layout for TableBack on narrow breakpoints. */
import { useState } from 'react';
import { Box } from '../../../Box';
import { Skeleton } from '../../../Skeleton';
import { TableEmptyState } from '../../../../../icons';
import { TABLE_CARDS_PAGE_SIZE } from '../hooks/useCardBreakpointRowPerPage';
import { ActionButtons } from './ActionButtons';
import { getTableCellInner } from './tableCellDisplay';
import { ImageCell } from './ImageCell';
import styles from '../Table.module.css';

const card = {
  cards: 'tableback-cards',
  card: 'tableback-card',
  cardFields: 'tableback-card-fields',
  cardRow: 'tableback-card-row',
  cardLabel: 'tableback-card-label',
  cardValue: 'tableback-card-value',
  cardActions: 'tableback-card-actions',
};

function resolveImageSrc(row, column) {
  if (typeof column?.urlField === 'function') return column.urlField(row);
  if (typeof column?.urlField === 'string') return column.urlField;
  if (column?.field != null) return row[column.field];
  return undefined;
}

function CardsSkeleton({ count = 4 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Box key={i} className={card.card}>
          <Box className={card.cardRow}>
            <Skeleton height={14} width="30%" />
            <Skeleton height={14} width="50%" />
          </Box>
          <Box className={card.cardRow}>
            <Skeleton height={14} width="25%" />
            <Skeleton height={14} width="60%" />
          </Box>
          <Box className={card.cardRow}>
            <Skeleton height={14} width="20%" />
            <Skeleton height={14} width="40%" />
          </Box>
        </Box>
      ))}
    </>
  );
}

function CardCellValue({ row, column, className }) {
  if (column?.type === 'image') {
    const value = resolveImageSrc(row, column);
    const altValue =
      column?.altField != null ? row[column.altField] : column?.alt ?? column?.label ?? '';
    return (
      <span className={className} style={{ minWidth: 0 }}>
        <ImageCell
          value={value}
          alt={altValue}
          expandOnClick={Boolean(column?.expandOnClick)}
          thumbClassName={column?.thumbClassName ?? ''}
        />
      </span>
    );
  }

  const { isEmpty, isBoolean, node } = getTableCellInner(row, column);
  return (
    <span
      className={className}
      style={{
        color: isEmpty ? 'var(--color-text-placeholder)' : 'var(--color-text-heading)',
        fontSize: isBoolean ? undefined : '14px',
        display: isBoolean ? 'flex' : undefined,
        alignItems: 'center',
        justifyContent: isBoolean ? 'flex-end' : undefined,
        width: isBoolean ? '100%' : undefined,
        minWidth: 0,
      }}
    >
      {node}
    </span>
  );
}

function CardCheckbox({ row, selectedRow }) {
  if (!selectedRow) return null;
  const { checkedList, key: keyToCheckSelected, onSelectRow } = selectedRow;
  const isChecked = checkedList?.some((r) => r[keyToCheckSelected] === row[keyToCheckSelected]);
  return (
    <label className="flex items-center justify-end gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={isChecked}
        onClick={(e) => onSelectRow(e, row)}
        readOnly
      />
    </label>
  );
}

export const TableCards = ({
  rows = [],
  columns = [],
  actions = null,
  selectedRow = null,
  isLoading = false,
  rowPerPage = 10,
  /** Si es true, muestra las mismas acciones en fila que la tabla (toggle + iconos), no el menú ⋮ */
  inlineRowActions = false,
}) => {
  const [modalOpen, setModalOpen] = useState(null);

  if (isLoading) {
    return (
      <Box className={`${styles['container-table']} special-scroll`}>
        <Box className={card.cards}>
          <CardsSkeleton count={Math.min(rowPerPage, TABLE_CARDS_PAGE_SIZE)} />
        </Box>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box className={`${styles['container-table']} special-scroll`}>
        <Box className={styles['table-empty-state']}>
          <Box className={styles['table-empty-state-icon']} aria-hidden>
            <TableEmptyState width={48} height={48} />
          </Box>
          <Box className={styles['table-empty-state-title']}>Sin resultados</Box>
          <Box className={styles['table-empty-state-text']}>
            No se encontraron registros para mostrar.
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`${styles['container-table']} special-scroll`}>
      <Box className={card.cards}>
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} className={card.card}>
          <Box className={card.cardFields}>
            {selectedRow && (
              <Box className={card.cardRow}>
                <span className={card.cardLabel}>Seleccionar</span>
                <Box className={card.cardValue}>
                  <CardCheckbox row={row} selectedRow={selectedRow} />
                </Box>
              </Box>
            )}
            {columns.map((column, colIndex) => (
              <Box key={colIndex} className={card.cardRow}>
                <span className={card.cardLabel}>
                  {column.label ?? column.field}
                </span>
                {typeof column.render === 'function' ? (
                  <Box className={card.cardValue}>{column.render(row)}</Box>
                ) : (
                  <CardCellValue row={row} column={column} className={card.cardValue} />
                )}
              </Box>
            ))}
          </Box>
          {actions && actions.length > 0 && (
            <Box className={card.cardActions}>
              {inlineRowActions ? (
                <Box className={styles['table-actions-row']}>
                  <ActionButtons
                    actions={actions}
                    row={row}
                    inResponsive={false}
                    setModalOpen={setModalOpen}
                    rowIndex={rowIndex}
                  />
                </Box>
              ) : (
                <ActionButtons
                  actions={actions}
                  row={row}
                  inResponsive={true}
                  setModalOpen={setModalOpen}
                  rowIndex={rowIndex}
                />
              )}
            </Box>
          )}
        </Box>
      ))}
      </Box>
    </Box>
  );
};
