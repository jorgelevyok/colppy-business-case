/** Column header with optional sort control and resize handle. */
import { Sort } from '../../../../../icons';
import { Box } from '../../../Box';
import styles from '../Table.module.css';

export const CellHeader = ({ size, column, sort, handleMouseDown, index, hiddeSort }) => {
  const colWidth = size ?? column?.width;
  const colMinWidth = column?.minWidth ?? size;
  const colMaxWidth = column?.maxWidth ?? size;

  return (
    <th
      id="cell-header"
      className="cursor-pointer"
      key={index}
      style={{ width: colWidth, minWidth: colMinWidth, maxWidth: colMaxWidth }}
    >
      <Box className={styles['container-th']}>
        <Box
          className={`${styles['container-th-content']} flex !justify-between !items-start w-full pr-4`}
          onClick={() => sort(column)}
        >
          <Box className="flex-col justify-start !items-start w-fit">
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--color-text-body)',
                letterSpacing: '-0.1504px',
              }}
            >
              {column?.label}
            </span>
            {column?.sublabel && <span className="!text-xs !font-normal"> {column.sublabel} </span>}
          </Box>
          <Box>
            <Sort sort={column?.sort} color={hiddeSort ? 'var(--color-text-sort-hidden)' : undefined} />
          </Box>
        </Box>
        <div
          className={`${styles.resizer} no-select`}
          onMouseDown={(e) => handleMouseDown(index, e)}
        />
      </Box>
    </th>
  );
};
