export const Sort = ({ width = 16, height = 16, sort: _sort, color, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || 'currentColor'}
    aria-hidden
    {...props}
  >
    <path
      d="M8 6v12M8 18l-3-3M8 18l3-3"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 18V6M16 6l-3 3M16 6l3 3"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
