/**
 * Drag-and-drop and picker for CSV/spreadsheet files with accept and size validation.
 */
import { useMemo, useRef, useState } from 'react';
import { CloudUpload, FileDocument } from '../../../icons';
import { Button } from '../../ui/Button';
import './InputFile.css';

const parseAcceptString = (accept) => {
  if (!accept || typeof accept !== 'string') return null;
  const tokens = accept
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const mimeTypes = [];
  const extensions = [];
  for (const t of tokens) {
    if (t.startsWith('.')) extensions.push(t.toLowerCase());
    else mimeTypes.push(t.toLowerCase());
  }
  if (mimeTypes.length === 0 && extensions.length === 0) return null;
  return { mimeTypes, extensions };
};

const fileMatchesAccept = (file, rules) => {
  if (!rules) return true;
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  for (const m of rules.mimeTypes) {
    if (m.endsWith('/*')) {
      if (type && type.startsWith(m.slice(0, -1))) return true;
      continue;
    }
    if (type === m) return true;
  }
  for (const ext of rules.extensions) {
    if (name.endsWith(ext)) return true;
  }
  return false;
};

export const InputFile = ({
  accept = '.csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  onChange = () => {},
  value = null,
  disabled = false,
  maxSizeMb = 5,
  hint = 'Arrastrá tu archivo acá',
  subhint = 'o buscalo en tu computadora',
}) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const acceptRules = useMemo(() => parseAcceptString(accept), [accept]);

  const applyFile = (file) => {
    if (!file) {
      setError('');
      onChange(null);
      return;
    }
    if (!fileMatchesAccept(file, acceptRules)) {
      setError('Formato no permitido. Usá .csv o .xlsx');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`El archivo supera los ${maxSizeMb} MB`);
      return;
    }
    setError('');
    onChange(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0] ?? null;
    applyFile(file);
  };

  return (
    <div className="input-file">
      <div
        className={`input-file__dropzone ${dragOver ? 'input-file__dropzone--active' : ''} ${value ? 'input-file__dropzone--filled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          disabled={disabled}
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
        {value ? (
          <div className="input-file__selected">
            <FileDocument width={28} height={28} />
            <div className="min-w-0">
              <p className="input-file__selected-name">{value.name}</p>
              <p className="input-file__selected-meta">
                {(value.size / 1024).toFixed(1)} KB · listo para importar
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="input-file__icon">
              <CloudUpload width={28} height={28} />
            </div>
            <p className="input-file__hint">{hint}</p>
            <p className="input-file__subhint">{subhint}</p>
            <Button
              type="button"
              variant="secondary"
              className="!mt-4"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Seleccionar archivo
            </Button>
          </>
        )}
      </div>
      {error ? <p className="input-file__error">{error}</p> : null}
      {value ? (
        <div className="input-file__actions">
          <Button type="button" variant="ghost" onClick={() => applyFile(null)}>
            Quitar archivo
          </Button>
        </div>
      ) : null}
    </div>
  );
};
