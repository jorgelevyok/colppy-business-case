/** Column resize drag behavior for the desktop table. */
import { useEffect, useRef, useState } from 'react';

export const useTableResieze = (columns = [], actions, selectedRow) => {
  const initialWidth = 150;
  const [actionWidth, setActionWidth] = useState(actions ? 120 : 0);
  const checkboxWidth = selectedRow ? 60 : 0;
  const tableRef = useRef(null);
  const resizingColumn = useRef(null);
  const [columnWidths, setColumnWidths] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (tableRef.current) {
        const allColumns = tableRef.current.querySelectorAll('#cell-header');
        const actionsColumn = tableRef.current.querySelector('#actions_button');
        setActionWidth(actionsColumn ? actionsColumn.offsetWidth : 0);
        setColumnWidths([...allColumns].map((col, i) => columns[i]?.width ?? col.offsetWidth));
      }
    }, 700);
    return () => clearTimeout(t);
  }, [columns]);

  const handleMouseDown = (index, event) => {
    resizingColumn.current = { index, startX: event.clientX, startWidth: columnWidths[index] };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event) => {
    if (!resizingColumn.current) return;
    const { index, startX, startWidth } = resizingColumn.current;
    const deltaX = event.clientX - startX;
    const newWidth = Math.max(50, startWidth + deltaX);
    setColumnWidths((prev) => {
      const next = [...prev];
      next[index] = newWidth;
      return next;
    });
  };

  const handleMouseUp = () => {
    resizingColumn.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const totalWidth =
    columnWidths.length === 0
      ? '100%'
      : columnWidths.reduce((a, b) => a + b, 0) + checkboxWidth + actionWidth;

  return {
    tableRef,
    columnWidths,
    handleMouseDown,
    totalWidth,
    actionWidth,
    checkboxWidth,
  };
};
