/**
 * Custom select with portal popover for long option lists (used in forms and filters).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Input.css';
import './Select.css';

const POPOVER_GAP = 8;
const ESTIMATED_ITEM_HEIGHT = 40;
const MAX_VISIBLE_ITEMS = 6;

const getPopoverPosition = (triggerEl, optionCount) => {
  if (!triggerEl) {
    return { top: 0, left: 0, width: 240, transform: 'none' };
  }

  const rect = triggerEl.getBoundingClientRect();
  const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 16);
  const estimatedHeight = Math.min(optionCount, MAX_VISIBLE_ITEMS) * ESTIMATED_ITEM_HEIGHT + 16;
  const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP;
  const placeAbove = spaceBelow < estimatedHeight && rect.top > spaceBelow;

  let left = rect.left;
  left = Math.min(left, window.innerWidth - width - 8);
  left = Math.max(8, left);

  if (placeAbove) {
    return {
      top: Math.max(8, rect.top - POPOVER_GAP),
      left,
      width,
      transform: 'translateY(-100%)',
    };
  }

  return {
    top: rect.bottom + POPOVER_GAP,
    left,
    width,
    transform: 'none',
  };
};

export const Select = ({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Seleccionar…',
  disabled = false,
  required = false,
  className = '',
  leftIcon = null,
  validation = null,
  danger = false,
}) => {
  const hasError = Boolean(validation?.message) || danger;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 240,
    transform: 'none',
  });

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      setPosition(getPopoverPosition(triggerRef.current, options.length || 1));
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const emitChange = (nextValue) => {
    onChange?.({ target: { value: nextValue } });
  };

  const handleSelect = (optValue) => {
    emitChange(String(optValue));
    setOpen(false);
  };

  const popover =
    open &&
    createPortal(
      <div
        ref={popoverRef}
        className="select-popover"
        role="listbox"
        aria-label={label || 'Opciones'}
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          transform: position.transform,
        }}
      >
        {options.length === 0 ? (
          <div className="select-popover__empty">Sin opciones</div>
        ) : (
          options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`select-popover__option ${isSelected ? 'select-popover__option--selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            );
          })
        )}
      </div>,
      document.body
    );

  return (
    <div className={`field ${className}`} ref={rootRef}>
      {label && (
        <span className="field__label">
          {label}
          {required ? <span className="field__required"> *</span> : null}
        </span>
      )}

      <div
        className={`field__control field__control--select ${leftIcon ? 'field__control--left' : ''}`}
        data-danger={hasError || undefined}
      >
        {leftIcon ? <span className="field__icon field__icon--left">{leftIcon}</span> : null}
        <button
          ref={triggerRef}
          type="button"
          className={`field__input field__select select-trigger ${!selectedOption ? 'select-trigger--empty' : ''}`}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required || undefined}
          aria-invalid={hasError}
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev);
          }}
        >
          {selectedOption?.label || placeholder}
        </button>
      </div>

      {validation?.message && !validation?.onlyDanger ? (
        <div className="validation-message">{validation.message}</div>
      ) : null}

      {popover}
    </div>
  );
};
