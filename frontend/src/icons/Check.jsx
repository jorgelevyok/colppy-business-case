export function Check({ width = 24, height = 24, className, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={width} height={height} {...props}>
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
