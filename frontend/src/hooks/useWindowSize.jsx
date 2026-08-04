/**
 * Returns true when viewport width is within the given breakpoint range.
 */
import { useEffect, useState } from 'react';

/**
 * Tracks viewport width and whether it falls within an optional [min, max] breakpoint.
 * @param {[number, number]|undefined} breakpoint - Inclusive pixel range, e.g. [0, 1024]
 * @returns {{ inBreakpoint: boolean|number, size: boolean|number }}
 */
export const useWindowSize = (breakpoint /* Rango inclusivo [min, max] en px, ej. [0, 1024] */) => {
  const min = breakpoint?.[0];
  const max = breakpoint?.[1];

  const checkInBreakpoint = () => {
    if (min == null || max == null) return false;
    const w = window.innerWidth;
    return w >= min && w <= max;
  };

  const [size, setSize] = useState(breakpoint ? checkInBreakpoint() : window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      if (min != null && max != null) {
        setSize(checkInBreakpoint());
      } else {
        setSize(window.innerWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [min, max]);

  return {
    inBreakpoint: size,
    size: size,
  };
};
