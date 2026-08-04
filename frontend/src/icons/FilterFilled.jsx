export const FilterFilled = ({
  width = 14,
  height = 16,
  className,
  color = "currentColor",
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
      }}
      className={className}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 16"
        fill="none"
        width={width}
        height={height}
        {...props}
      >
        <path
          d="M13.25 1.12C13.45 0.82 13.24 0.4 12.88 0.4H1.12C0.76 0.4 0.55 0.82 0.75 1.12L5.4 8.08V14.4c0 0.22 0.18 0.4 0.4 0.4h2.4c0.22 0 0.4-0.18 0.4-0.4V8.08L13.25 1.12Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
