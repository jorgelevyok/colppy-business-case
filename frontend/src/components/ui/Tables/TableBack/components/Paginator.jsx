/** Page navigation and rows-per-page controls for TableBack. */
import { useEffect, useMemo } from 'react';
import { Box } from '../../../Box';
import sx from '../Table.module.css';

const formatPageNumber = (pageNumber) => {
    if (!Number.isFinite(pageNumber)) return '';
    if (pageNumber >= 0 && pageNumber < 100) return String(pageNumber).padStart(2, '0');
    return String(pageNumber);
};

const buildVisiblePages = (currentPage, totalPages) => {
    const total = Math.max(0, totalPages);
    if (total === 0) return [];
    if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, 5, 'ellipsis', total];
    }

    if (currentPage >= total - 2) {
        return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', total];
};

export const Paginator = ({
    totalPages,
    currentPage,
    setCurrentPage,
    totalRowsCount,
    rowPerPage,
    setRowPerPage,
    stepsRowPerPage,
    hidePaginatorLabels = false,
    showResultPerPage = true,
}) => {
    const pagesPaginator = useMemo(() => {
        return buildVisiblePages(currentPage, totalPages).map((page, index) => {
            if (page === 'ellipsis') {
                return (
                    <span key={`ellipsis-${index}`} className={sx['paginator-ellipsis']} aria-hidden="true">
                        ...
                    </span>
                );
            }

            const isActive = page === currentPage;
            return (
                <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    disabled={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${sx['paginator-page-button']}${isActive ? ` ${sx['paginator-page-button--active']}` : ''}`}
                >
                    <span>{formatPageNumber(page)}</span>
                </button>
            );
        });
    }, [currentPage, totalPages, setCurrentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages]);

    const changeRowPerPage = (e) => {
        const value = Number(e.target.value);
        setRowPerPage(value);
        setCurrentPage(1);
    };

    const startItem = (currentPage - 1) * rowPerPage + 1;
    const endItem = Math.min(currentPage * rowPerPage, totalRowsCount);

    return (
        <Box
            className={`${sx['paginator-wrapper']} flex flex-col md:flex-row justify-between items-center w-full gap-4`}
        >
            {!hidePaginatorLabels && (
                <Box className={`${sx['paginator-item-count']} !hidden md:!flex`}>
                    <span className={sx['paginator-item-count-text']}>
                        {startItem} a {endItem}
                    </span>
                    <span className={sx['paginator-item-count-de']}> de </span>
                    <span className={sx['paginator-item-count-text']}>{totalRowsCount}</span>
                </Box>
            )}

            <Box className={`${sx['paginator-navigation']} w-full md:w-auto flex justify-center`}>
                <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={sx['paginator-step-button']}
                >
                    Atras
                </button>

                <Box className={sx['paginator-pages-container']}>
                    <Box className={sx['paginator-container']}>{pagesPaginator}</Box>
                </Box>

                <button
                    type="button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={sx['paginator-step-button']}
                >
                    Siguiente
                </button>
            </Box>

            {showResultPerPage && stepsRowPerPage?.length > 0 && (
                <Box
                    className={`${sx['paginator-rows-selector']} w-full md:w-auto flex justify-center md:justify-end`}
                >
                    <span className={sx['paginator-rows-label']}>Filtrar por página</span>
                    <select
                        onChange={changeRowPerPage}
                        value={rowPerPage}
                        className={sx['paginator-select']}
                    >
                        {stepsRowPerPage.map((step, index) => (
                            <option value={step} key={index}>
                                {step}
                            </option>
                        ))}
                    </select>
                </Box>
            )}
        </Box>
    );
};
