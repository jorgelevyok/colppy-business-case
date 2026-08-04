/** Primary UI button with variant styles (primary, secondary, ghost, danger). */
import './Button.css';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];

export const Button = ({
  children,
  label,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const variantClass = VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--primary';
  const classNames = ['btn', variantClass, disabled ? 'btn--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children ?? label}
    </button>
  );
};
