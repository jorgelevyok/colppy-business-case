export function TableSearch({ className, width = 20, height = 20, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={width} height={height} {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    </div>
  );
}
