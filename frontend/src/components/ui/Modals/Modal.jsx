/**
 * Accessible modal overlay with backdrop, optional title/subtitle, and footer slot.
 */
import { useEffect } from 'react';
import { Plus } from '../../../icons';
import { Box } from '../Box';
import styles from './Modal.module.css';

export function Modal({
  children,
  bottom,
  open,
  setOpen,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  title,
  subtitle,
  icon,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed z-[11000] inset-0 flex flex-col items-center justify-center w-[100dvw] h-[100dvh] p-3">
      <Box
        className={`absolute inset-0 w-full h-full z-[5] ${styles.backdrop}`}
        style={{ backgroundColor: 'var(--color-overlay)' }}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <Box
        className={`flex flex-col w-[94vw] max-w-[560px] max-h-[90vh] rounded-2xl z-10 relative overflow-hidden ${className}`}
        style={{
          backgroundColor: 'var(--container-background)',
          boxShadow: 'var(--shadow-modal)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {(title || subtitle || icon) && (
          <Box className="flex-shrink-0 w-full relative">
            <Box className="py-5 px-5 min-[640px]:px-6 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-10">
                {icon && (
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--color-info-bg)',
                      color: 'var(--color-info-text)',
                    }}
                  >
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <h2
                      className="text-lg min-[640px]:text-xl font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-subtitle)' }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Box>
            {showCloseButton && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(false)}
                onKeyDown={(e) => e.key === 'Enter' && setOpen(false)}
                className={`rotate-45 absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors duration-200 z-20 ${styles.closeBtn}`}
                aria-label="Cerrar"
              >
                <Plus width={18} height={18} />
              </div>
            )}
          </Box>
        )}
        <Box className={`flex-1 min-h-0 overflow-auto px-5 min-[640px]:px-6 ${contentClassName}`.trim()}>
          {children}
        </Box>
        {bottom && <Box className="flex-shrink-0 w-full">{bottom}</Box>}
      </Box>
    </div>
  );
}
