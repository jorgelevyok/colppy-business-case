export const Calendar = ({ width = 18, height = 18, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 3.5v3M16 3.5v3M3.5 10h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
