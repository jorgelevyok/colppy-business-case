export function Money({ color = 'var(--color-text)', width = 24, height = 24, isActive = true, className }) {
  const stroke = isActive ? color : 'var(--color-text-muted)';
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }}
      className={className}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="2" />
        <path
          d="M15 9.94728C14.5 9.3 13.8 8.5 12 8.5C10.2 8.5 9 9.51393 9 9.94728C9 10.3806 9.06786 10.9277 10 11.5C10.7522 11.9618 12.6684 12.0439 13.5 12.5C14.679 13.1467 14.8497 13.8202 14.8497 14.0522C14.8497 14.6837 13.4175 15.4852 12 15.5C10.536 15.5153 9.5 14.7 9 14.0522"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 7V17" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
