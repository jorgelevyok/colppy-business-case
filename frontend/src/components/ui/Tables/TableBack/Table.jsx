/** Desktop table grid: headers, cells, selection, and row actions. */
import { Fragment, useMemo, useState } from 'react';
import { useWindowSize } from '../../../../hooks';
import { TableEmptyState } from '../../../../icons';
import { Box } from '../../Box';
import { ActionButtons } from './components/ActionButtons';
import { CellCheckbox } from './components/CellCheckbox';
import { CellHeader } from './components/CellHeader';
import { CellValue } from './components/CellValue';
import { TableSkeleton } from './components/TableSkeleton';
import { useTableResieze } from './hooks/useTableResieze';
import styles from './Table.module.css';

export const Table = ({
    columns = [],
    rows = [],
    selectedRow = null,
    actions = null,
    sort = () => {},
    isLoading = false,
    rowPerPage,
    hiddeSort = false,
    inBreackpoingProp = null,
    testId,
}) => {
    const { totalWidth, tableRef, columnWidths, handleMouseDown, checkboxWidth, actionWidth } =
        useTableResieze(columns, actions, selectedRow, rows);
    const inBreakpoint =
        inBreackpoingProp === null ? useWindowSize([0, 767]).inBreakpoint : inBreackpoingProp;

    const tableHeader = useMemo(
        () => (
            <TableHeader
                handleMouseDown={handleMouseDown}
                actionWidth={actionWidth}
                columnWidths={columnWidths}
                checkboxWidth={checkboxWidth}
                columns={columns}
                selectedRow={selectedRow}
                sort={sort}
                actions={actions}
                hiddeSort={hiddeSort}
                inResponsive={inBreakpoint}
            />
        ),
        [
            columns,
            selectedRow,
            columnWidths,
            inBreakpoint,
            actions,
            sort,
            hiddeSort,
            handleMouseDown,
            actionWidth,
            checkboxWidth,
        ]
    );

    const tableRows = useMemo(
        () => (
            <TableRows
                rows={rows}
                selectedRow={selectedRow}
                columns={columns}
                actions={actions}
                inResponsive={inBreakpoint}
                testId={testId}
            />
        ),
        [rows, columns, selectedRow, actions, inBreakpoint]
    );

    return (
        <Box className={`${styles['container-table']} special-scroll`}>
            <table ref={tableRef} className={styles.table} style={{ width: totalWidth }}>
                <thead>
                    <tr>{tableHeader}</tr>
                </thead>
                <tbody>
                    {!isLoading ? (
                        tableRows
                    ) : (
                        <TableSkeleton
                            columnsCount={
                                columns.length + (selectedRow ? 1 : 0) + (actions ? 1 : 0)
                            }
                            rowPerPage={rowPerPage}
                        />
                    )}
                </tbody>
            </table>
            {rows.length === 0 && !isLoading && (
                <Box className={styles['table-empty-state']}>
                    <Box className={styles['table-empty-state-icon']} aria-hidden>
                        <TableEmptyState width={48} height={48} />
                    </Box>
                    <Box className={styles['table-empty-state-title']}>Sin resultados</Box>
                    <Box className={styles['table-empty-state-text']}>
                        No se encontraron registros para mostrar.
                    </Box>
                </Box>
            )}
        </Box>
    );
};

function TableHeader({
    handleMouseDown,
    columnWidths,
    checkboxWidth,
    columns,
    selectedRow,
    sort,
    actions,
    hiddeSort,
    inResponsive,
}) {
    return (
        <>
            {selectedRow && (
                <th
                    style={{
                        width: checkboxWidth,
                        minWidth: checkboxWidth,
                        maxWidth: checkboxWidth,
                    }}
                >
                    {' '}
                </th>
            )}
            {columns.map((column, index) => (
                <Fragment key={index}>
                    <CellHeader
                        size={columnWidths[index]}
                        column={column}
                        sort={sort}
                        handleMouseDown={handleMouseDown}
                        index={index}
                        hiddeSort={hiddeSort}
                    />
                </Fragment>
            ))}
            {actions && (
                <th id="actions_button" className={styles['table-actions-buttons']}>
                    <div className="flex justify-center items-center">
                        <Box className={styles['container-th']}>
                            <span
                                style={{
                                    fontWeight: 600,
                                }}
                            >
                                Acciones
                            </span>
                        </Box>
                    </div>
                </th>
            )}
        </>
    );
}

function TableRows({ rows, selectedRow, columns, actions, inResponsive, testId }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            {rows.length > 0 &&
                rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="data-table-row">
                        {selectedRow && (
                            <CellCheckbox
                                row={row}
                                checkedList={selectedRow.checkedList}
                                keyToCheckSelected={selectedRow.key}
                                onSelectRow={selectedRow.onSelectRow}
                                testId={`${testId}-row-${rowIndex}-checkbox`}
                            />
                        )}
                        {columns.map((column, index) => (
                            <CellValue row={row} column={column} key={index} />
                        ))}
                        {actions && (
                            <td
                                className={styles['table-actions-buttons']}
                                style={{ zIndex: modalOpen === rowIndex ? 9998 : 1000 - rowIndex }}
                            >
                                <Box className={styles['container-actions']}>
                                    <ActionButtons
                                        actions={actions}
                                        row={row}
                                        inResponsive={inResponsive}
                                        setModalOpen={setModalOpen}
                                        rowIndex={rowIndex}
                                        testId={testId}
                                    />
                                </Box>
                            </td>
                        )}
                    </tr>
                ))}
        </>
    );
}
