export const Package = ({ width = 20, height = 20, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
