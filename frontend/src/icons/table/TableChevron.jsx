export function TableChevron({ direction = 'right', width = 20, height = 20, className, style, ...props }) {
  const isLeft = direction === 'left';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        ...(isLeft ? { transform: 'rotate(180deg)' } : {}),
        ...style,
      }}
      className={className}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={width} height={height} {...props}>
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
