export const Upload = ({ width = 18, height = 18, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 16V4M12 4l-4 4M12 4l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
