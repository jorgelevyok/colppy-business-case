/** Loading placeholder rows while TableBack fetches data. */
import { Skeleton } from '../../../Skeleton';

export const TableSkeleton = ({ rowPerPage = 10, columnsCount }) => {
  return (
    <>
      {[...Array(Math.min(rowPerPage, 10))].map((_, i) => (
        <tr key={i}>
          {[...Array(columnsCount || 5)].map((_, j) => (
            <td key={j}>
              <Skeleton height="30%" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
