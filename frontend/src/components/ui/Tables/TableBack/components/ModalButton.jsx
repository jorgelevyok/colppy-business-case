/** Mobile modal wrapper for table toolbar (search/filters) on small viewports. */
import { Box } from '../../../Box';
import { Close } from '../../../../../icons';

export function ModalButton({ children, isOpen, setIsOpen, onClose, className = '' }) {
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <Box className={`tableback-modal-main ${className}`.trim()} data-open={isOpen}>
      <Box className="tableback-modal-bg" onClick={handleClose} aria-hidden />
      <Box className="tableback-modal-box">
        <Box className="tableback-modal-close" onClick={handleClose}>
          <Close />
        </Box>
        {children}
      </Box>
    </Box>
  );
}
