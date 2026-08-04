/**
 * Server-driven data table: search, filters, pagination, row actions, and mobile card layout.
 * Exposes ref API: getData, getTableData, appliedFilters, searchTerm, filter helpers.
 */
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useWindowSize } from '../../../../hooks';
import { DotsVertical } from '../../../../icons';
import { Box } from '../../Box';
import { Button } from '../../Button';
import { AppliedFilters } from './components/AppliedFilters';
import { Filters } from './components/Filters';
import { InputSearch } from './components/InputSearch';
import { ModalButton } from './components/ModalButton';
import { Paginator } from './components/Paginator';
import { TableCards } from './components/TableCards';
import { useCardBreakpointRowPerPage } from './hooks/useCardBreakpointRowPerPage';
import { useTableActions, wrapSwitchActionsWithRefresh } from './hooks/useTableActions';
import { useTableBack } from './hooks/useTableBack';
import { Table } from './Table';
import sx from './Table.module.css';
import './TableBack.css';

export const TableBack = forwardRef(function TableBack(
    {
        columns,
        config = {},
        filters,
        HeaderRight,
        HeaderCenter,
        afterFilters,
        MenuMobileClassName,
        title,
        showHeaderComponentsInModal = false,
        className,
        testId = 'table-back',
    },
    ref
) {
    const useTable = useTableBack(columns, config, filters);

    const refreshTableRef = useRef(useTable.getData);
    refreshTableRef.current = useTable.getData;

    useImperativeHandle(ref, () => ({
        getData: useTable.getData,
        getTableData: () => useTable.rows,
        searchTerm: useTable.searchTerm,
        appliedFilters: useTable.appliedFilters,
        setAppliedFilters: useTable.setAppliedFilters,
        addFilter: useTable.addFilter,
        removeFilter: useTable.removeFilter,
        cleanAllFilters: useTable.cleanAllFilters,
    }));

    const { inBreakpoint } = useWindowSize([0, 1024]);
    useCardBreakpointRowPerPage(
        inBreakpoint && Boolean(config?.paginator?.show),
        useTable.rowPerPage,
        useTable.setRowPerPage
    );
    const [modalMobileOpen, setModalMobileOpen] = useState(false);

    const actionsWithRefresh = useMemo(
        () => wrapSwitchActionsWithRefresh(config?.actions, () => refreshTableRef.current?.()),
        [config?.actions]
    );
    const filteredActions = useTableActions(actionsWithRefresh);

    const hasSearchOrFilters = config?.search?.show || (filters && Object.keys(filters).length > 0);

    const hasHeaderTitleRow =
        (title != null && title !== '') || HeaderRight != null || HeaderCenter != null;

    return (
        <Box
            className={`w-full min-w-0 m-auto relative flex flex-col items-end justify-end h-full ${sx['table-back-container']} ${className ?? ''}`}
        >
            <Box className="w-full flex flex-col gap-4">
                {/* Fila 1: título + botón principal (ej. Nueva publicación) */}
                {hasHeaderTitleRow ? (
                    <Box className="tableback-header-row w-full flex flex-wrap justify-between items-center gap-4">
                        <Box className="flex items-center text-lg font-bold flex-shrink-0 mb-4">
                            {title}
                        </Box>
                        {(!inBreakpoint || !showHeaderComponentsInModal) && HeaderRight && (
                            <Box className="tableback-header-right">{HeaderRight}</Box>
                        )}
                        {inBreakpoint &&
                            showHeaderComponentsInModal &&
                            (HeaderCenter || HeaderRight) && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setModalMobileOpen(true)}
                                    className="!w-[42px] !p-0"
                                >
                                    <DotsVertical />
                                </Button>
                            )}
                    </Box>
                ) : null}

                {/* Fila 2: buscar + filtrar + HeaderCenter (diseño Figma: gap 8px) */}
                {hasSearchOrFilters || HeaderCenter || config?.select_rows?.optional ? (
                    <Box className="tableback-search-filter-row w-full justify-end">
                        {config?.search?.show && (
                            <InputSearch
                                value={useTable.searchTerm}
                                onChange={(e) => useTable.setSearchTerm(e.target.value)}
                                placeholder="Buscar"
                                aria-label="Buscar"
                                inputClassName="tableback-input-search"
                                testId="table-search-input"
                            />
                        )}
                        {filters && (
                            <Filters
                                columns={useTable.columnsToUse}
                                filters={filters}
                                appliedFilters={useTable.appliedFilters}
                                setAppliedFilters={useTable.setAppliedFilters}
                                cleanAllFilters={useTable.cleanAllFilters}
                            />
                        )}
                        {afterFilters && (
                            <Box className="tableback-export-wrap">{afterFilters}</Box>
                        )}
                        {(((!inBreakpoint || !showHeaderComponentsInModal) && HeaderCenter) ||
                            config?.select_rows?.optional) && (
                            <Box className="flex gap-6 flex-grow-[1] flex-wrap items-center">
                                {(!inBreakpoint || !showHeaderComponentsInModal) &&
                                    HeaderCenter && <Box>{HeaderCenter}</Box>}
                            </Box>
                        )}
                    </Box>
                ) : null}
            </Box>
            {filters && Object.keys(filters).length > 0 ? (
                <AppliedFilters
                    appliedFilters={useTable.appliedFilters}
                    setAppliedFilters={useTable.setAppliedFilters}
                    filtersConfig={filters}
                />
            ) : null}
            {inBreakpoint && showHeaderComponentsInModal && (HeaderCenter || HeaderRight) && (
                <ModalButton
                    isOpen={modalMobileOpen}
                    setIsOpen={setModalMobileOpen}
                    className="!z-[10000]"
                >
                    <Box className={`flex flex-col gap-6 p-12 ${MenuMobileClassName || ''}`}>
                        {HeaderCenter} {HeaderRight}
                    </Box>
                </ModalButton>
            )}
            {useTable.rows &&
                (inBreakpoint ? (
                    <TableCards
                        rows={useTable.rows}
                        columns={useTable.columnsToUse}
                        actions={filteredActions}
                        selectedRow={
                            useTable.showCheckbox &&
                            config?.select_rows && {
                                checkedList: useTable.checkedList,
                                onSelectRow: useTable.onSelectRow,
                                key: config.select_rows.key,
                            }
                        }
                        isLoading={useTable.isLoading}
                        rowPerPage={useTable.rowPerPage}
                        testId={`${testId}-cards`}
                    />
                ) : (
                    <Table
                        rows={useTable.rows}
                        columns={useTable.columnsToUse}
                        actions={filteredActions}
                        selectedRow={
                            useTable.showCheckbox &&
                            config?.select_rows && {
                                checkedList: useTable.checkedList,
                                onSelectRow: useTable.onSelectRow,
                                key: config.select_rows.key,
                            }
                        }
                        isLoading={useTable.isLoading}
                        rowPerPage={useTable.rowPerPage}
                        hiddeSort={true}
                        inBreackpoingProp={false}
                        testId={`${testId}`}
                    />
                ))}

            {config?.paginator?.show && useTable.totalRowsCount > 0 && (
                <Box className="w-full mt-4">
                    <Paginator
                        totalPages={useTable.totalPages}
                        currentPage={useTable.currentPage}
                        setCurrentPage={useTable.setCurrentPage}
                        rowPerPage={useTable.rowPerPage}
                        setRowPerPage={useTable.setRowPerPage}
                        showResultPerPage={
                            Boolean(config?.paginator?.show_results_per_page) && !inBreakpoint
                        }
                        stepsRowPerPage={useTable.stepsRowsPerPage}
                        totalRowsCount={useTable.totalRowsCount}
                    />
                </Box>
            )}
        </Box>
    );
});
