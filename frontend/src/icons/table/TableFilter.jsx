export function TableFilter({ width = 20, height = 20, className, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={width} height={height} {...props}>
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
