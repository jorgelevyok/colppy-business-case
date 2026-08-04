export const FileSpreadsheet = ({ width = 20, height = 20, ...props }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 13h8M8 17h8M12 11v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
