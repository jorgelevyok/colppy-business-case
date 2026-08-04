export function TableDotsVertical({ className, width = 20, height = 20, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={width} height={height} {...props}>
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </div>
  );
}
