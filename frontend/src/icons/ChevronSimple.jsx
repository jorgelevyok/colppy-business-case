export function ChevronSimple({ width = 6, height = 10, color = 'var(--color-text)', className }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }}
      className={className}
    >
      <svg width={width} height={height} viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L1 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
