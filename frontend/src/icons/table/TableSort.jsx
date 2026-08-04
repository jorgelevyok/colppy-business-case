export function TableSort({ sort, color, width = 16, height = 16 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" width={width} height={height}>
        <path d="M11 5h10M11 9h7M11 13h4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
