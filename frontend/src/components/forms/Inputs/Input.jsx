/** Styled text input with optional label, icons, and validation message display. */
import './Input.css';

/** @param {object} props - Standard input props plus label, validation, leftIcon, rightIcon. */
export const Input = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  leftIcon = null,
  rightIcon = null,
  validation = null,
  danger = false,
  ...props
}) => {
  const hasError = Boolean(validation?.message) || danger;

  return (
    <label className={`field ${className}`}>
      {label && (
        <span className="field__label">
          {label}
          {required ? <span className="field__required"> *</span> : null}
        </span>
      )}
      <span
        className={`field__control ${leftIcon ? 'field__control--left' : ''} ${rightIcon ? 'field__control--right' : ''}`}
        data-danger={hasError || undefined}
      >
        {leftIcon ? <span className="field__icon field__icon--left">{leftIcon}</span> : null}
        <input
          className="field__input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          {...props}
        />
        {rightIcon ? <span className="field__icon field__icon--right">{rightIcon}</span> : null}
      </span>
      {validation?.message && !validation?.onlyDanger ? (
        <div className="validation-message">{validation.message}</div>
      ) : null}
    </label>
  );
};
