/** Polymorphic layout wrapper (defaults to div) with ref forwarding. */
import { forwardRef } from 'react';

export const Box = forwardRef(function Box(
  { children, className, as = 'div', ...props },
  ref
) {
  const Element = as;
  return (
    <Element ref={ref} className={className} {...props}>
      {children}
    </Element>
  );
});
