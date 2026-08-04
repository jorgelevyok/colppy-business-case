export const User = ({ width = 18, height = 18, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5 19c1.6-3.2 4-4.8 7-4.8S17.4 15.8 19 19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
