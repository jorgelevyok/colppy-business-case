/** Single data cell: applies column getLabel and optional image column handling. */
import { ImageCell } from './ImageCell';
import { getTableCellInner } from './tableCellDisplay';

function resolveImageSrc(row, column) {
    if (typeof column?.urlField === 'function') return column.urlField(row);
    if (typeof column?.urlField === 'string') return column.urlField;
    if (column?.field != null) return row[column.field];
    return undefined;
}

export const CellValue = ({ row, column }) => {
    if (typeof column?.render === 'function') {
        return <td>{column.render(row)}</td>;
    }

    if (column?.type === 'image') {
        const value = resolveImageSrc(row, column);
        const altValue =
            column?.altField != null ? row[column.altField] : (column?.alt ?? column?.label ?? '');
        return (
            <td className="flex items-center">
                <ImageCell
                    value={value}
                    alt={altValue}
                    expandOnClick={Boolean(column?.expandOnClick)}
                    thumbClassName={column?.thumbClassName ?? ''}
                />
            </td>
        );
    }

    const { isEmpty, isBoolean, node } = getTableCellInner(row, column);

    return (
        <td>
            <span
                style={{
                    color: isEmpty ? 'var(--color-text-placeholder)' : 'var(--color-text-heading)',
                    fontSize: isBoolean ? undefined : '14px',
                    display: isBoolean ? 'inline-flex' : undefined,
                    alignItems: 'center',
                }}
            >
                {node}
            </span>
        </td>
    );
};
