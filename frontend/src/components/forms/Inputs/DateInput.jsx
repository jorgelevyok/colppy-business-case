/**
 * Date picker input storing values as yyyy-mm-dd ISO strings.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from '../../../icons';
import './DateInput.css';
import './Input.css';

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const POPOVER_WIDTH = 292;
const POPOVER_GAP = 8;

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseIsoDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatDisplay = (value) => {
  const date = parseIsoDate(value);
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
};

const sameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getPopoverPosition = (triggerEl) => {
  if (!triggerEl) return { top: 0, left: 0, placement: 'bottom' };

  const rect = triggerEl.getBoundingClientRect();
  const width = Math.min(POPOVER_WIDTH, window.innerWidth - 16);
  const estimatedHeight = 320;
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
      placement: 'top',
      transform: 'translateY(-100%)',
    };
  }

  return {
    top: rect.bottom + POPOVER_GAP,
    left,
    width,
    placement: 'bottom',
    transform: 'none',
  };
};

export const DateInput = ({
  label,
  value = '',
  onChange,
  disabled = false,
  required = false,
  className = '',
  placeholder = 'dd/mm/aaaa',
  validation = null,
  danger = false,
}) => {
  const hasError = Boolean(validation?.message) || danger;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const selected = useMemo(() => parseIsoDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected || new Date()));
  const [position, setPosition] = useState({ top: 0, left: 0, width: POPOVER_WIDTH, transform: 'none' });

  useEffect(() => {
    if (selected) setViewMonth(startOfMonth(selected));
  }, [selected]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      setPosition(getPopoverPosition(triggerRef.current));
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

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

  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const handleSelect = (date) => {
    emitChange(toIsoDate(date));
    setOpen(false);
  };

  const popover =
    open &&
    createPortal(
      <div
        ref={popoverRef}
        className="date-input__popover"
        role="dialog"
        aria-label="Selector de fecha"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          transform: position.transform,
        }}
      >
        <div className="date-input__header">
          <button
            type="button"
            className="date-input__nav"
            aria-label="Mes anterior"
            onClick={() =>
              setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
          >
            <ChevronLeft width={16} height={16} />
          </button>
          <strong>
            {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </strong>
          <button
            type="button"
            className="date-input__nav"
            aria-label="Mes siguiente"
            onClick={() =>
              setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
          >
            <ChevronRight width={16} height={16} />
          </button>
        </div>

        <div className="date-input__weekdays">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="date-input__grid">
          {days.map((date, index) =>
            date ? (
              <button
                key={toIsoDate(date)}
                type="button"
                className={[
                  'date-input__day',
                  sameDay(date, selected) ? 'date-input__day--selected' : '',
                  sameDay(date, today) ? 'date-input__day--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelect(date)}
              >
                {date.getDate()}
              </button>
            ) : (
              <span key={`empty-${index}`} className="date-input__day date-input__day--empty" />
            )
          )}
        </div>

        <div className="date-input__footer">
          <button
            type="button"
            className="date-input__action"
            onClick={() => {
              emitChange('');
              setOpen(false);
            }}
          >
            Borrar
          </button>
          <button
            type="button"
            className="date-input__action date-input__action--primary"
            onClick={() => handleSelect(today)}
          >
            Hoy
          </button>
        </div>
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
        className="field__control field__control--left date-input__control"
        data-danger={hasError || undefined}
      >
        <span className="field__icon field__icon--left">
          <Calendar width={16} height={16} />
        </span>
        <button
          ref={triggerRef}
          type="button"
          className={`field__input date-input__trigger ${!value ? 'date-input__trigger--empty' : ''}`}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-required={required || undefined}
          aria-invalid={hasError}
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev);
          }}
        >
          {value ? formatDisplay(value) : placeholder}
        </button>
      </div>

      {validation?.message && !validation?.onlyDanger ? (
        <div className="validation-message">{validation.message}</div>
      ) : null}

      {popover}
    </div>
  );
};
