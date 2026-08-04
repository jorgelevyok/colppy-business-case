export function Copy({ width = 20, height = 20, color = 'var(--color-text)', className }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height }}
      className={className}
    >
      <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 13L15.8 13C16.9201 13 17.4802 13 17.908 12.782C18.2843 12.5903 18.5903 12.2843 18.782 11.908C19 11.4802 19 10.9201 19 9.8L19 7L19 4.2C19 3.0799 19 2.51984 18.782 2.09202C18.5903 1.7157 18.2843 1.40973 17.908 1.21799C17.4802 1 16.9201 1 15.8 1L10.2 1C9.07989 1 8.51984 1 8.09202 1.21799C7.71569 1.40973 7.40973 1.7157 7.21799 2.09202C7 2.51984 7 3.0799 7 4.2L7 7"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.2 19C3.07989 19 2.51984 19 2.09202 18.782C1.71569 18.5903 1.40973 18.2843 1.21799 17.908C0.999999 17.4802 0.999999 16.9201 0.999999 15.8L0.999999 10.2C0.999999 9.0799 0.999999 8.51984 1.21799 8.09202C1.40973 7.7157 1.71569 7.40973 2.09202 7.21799C2.51984 7 3.07989 7 4.2 7L9.8 7C10.9201 7 11.4802 7 11.908 7.21799C12.2843 7.40973 12.5903 7.7157 12.782 8.09202C13 8.51984 13 9.0799 13 10.2L13 13L13 15.8C13 16.9201 13 17.4802 12.782 17.908C12.5903 18.2843 12.2843 18.5903 11.908 18.782C11.4802 19 10.9201 19 9.8 19L4.2 19Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
