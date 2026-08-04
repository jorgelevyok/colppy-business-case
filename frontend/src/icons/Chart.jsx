export const Chart = ({ width = 20, height = 20, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 19v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
