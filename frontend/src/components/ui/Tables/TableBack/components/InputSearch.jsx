/** Debounced search field for TableBack global text search. */
import { Close } from '../../../../../icons';

export const InputSearch = ({
    onChange = () => {},
    label,
    inputClassName = '',
    labelClassName = '',
    svgClassName = '',
    placeholder = '',
    value,
    ...props
}) => {
    const hasValue = value != null && String(value).length > 0;

    return (
        <div className="tableback-input-search-container">
            <input
                className={`tableback-input-search ${inputClassName}`.trim()}
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                aria-label={label || placeholder}
                {...props}
            />
            {hasValue ? (
                <button
                    type="button"
                    className={`tableback-input-search-clear ${svgClassName}`.trim()}
                    onClick={() => onChange({ target: { value: '' } })}
                    aria-label="Limpiar búsqueda"
                    tabIndex={-1}
                >
                    <Close width={16} height={16} />
                </button>
            ) : null}
        </div>
    );
};
