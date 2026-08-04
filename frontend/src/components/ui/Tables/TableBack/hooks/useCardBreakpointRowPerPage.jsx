/** Switches page size when TableBack uses card layout on mobile. */
import { useEffect, useRef } from 'react';

export const TABLE_CARDS_PAGE_SIZE = 5;

export const useCardBreakpointRowPerPage = (inCardBreakpoint, rowPerPage, setRowPerPage) => {
  const savedDesktopRowPerPageRef = useRef(null);

  useEffect(() => {
    if (!inCardBreakpoint) {
      if (savedDesktopRowPerPageRef.current != null) {
        setRowPerPage(savedDesktopRowPerPageRef.current);
        savedDesktopRowPerPageRef.current = null;
      }
      return;
    }
    if (rowPerPage !== TABLE_CARDS_PAGE_SIZE) {
      savedDesktopRowPerPageRef.current = rowPerPage;
      setRowPerPage(TABLE_CARDS_PAGE_SIZE);
    }
  }, [inCardBreakpoint, rowPerPage, setRowPerPage]);
};
