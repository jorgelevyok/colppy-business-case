/** Renders image thumbnail cells with optional lightbox modal. */
import { useMemo, useState } from 'react';
import { ModalButton } from './ModalButton';
import { Box } from '../../../Box';

function normalizeImageValue(value) {
  if (value == null || value === '') return { src: null, alt: '' };
  if (typeof value === 'string') return { src: value, alt: '' };
  if (typeof value === 'object') {
    const src = value?.src ?? value?.url ?? null;
    const alt = value?.alt ?? '';
    return { src, alt };
  }
  return { src: String(value), alt: '' };
}

export const ImageCell = ({ value, alt, expandOnClick = false, thumbClassName = '' }) => {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  const img = useMemo(() => normalizeImageValue(value), [value]);
  const src = broken ? null : img.src;
  const computedAlt = alt ?? img.alt ?? '';

  if (!src) return <span className="tableback-image-empty">—</span>;

  const imageEl = (
    <img
      src={src}
      alt={computedAlt}
      className={`tableback-image-thumb ${expandOnClick ? 'tableback-image-thumb--clickable' : ''} ${thumbClassName}`.trim()}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );

  if (!expandOnClick) return imageEl;

  return (
    <>
      <button
        type="button"
        className="tableback-image-btn"
        onClick={() => setOpen(true)}
        aria-label="Ver imagen"
      >
        {imageEl}
      </button>
      <ModalButton isOpen={open} setIsOpen={setOpen} className="tableback-image-modal">
        <Box className="tableback-image-modal-content">
          <img
            src={src}
            alt={computedAlt}
            className="tableback-image-modal-img"
            onError={() => setBroken(true)}
          />
        </Box>
      </ModalButton>
    </>
  );
};

