/**
 * DOM toast notifications used by the API layer and feature screens.
 */
const TOAST_COLORS = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-primary)',
};

const TOAST_ICONS = {
  success:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/></svg>',
  error:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/></svg>',
  warning:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4C9.87827 4 7.84344 4.84285 6.34315 6.34315C4.84285 7.84344 4 9.87827 4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20ZM12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289C12.8946 7.48043 13 7.73478 13 8V13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13V8C11 7.73478 11.1054 7.48043 11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7ZM12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071C11.1054 16.5196 11 16.2652 11 16C11 15.7348 11.1054 15.4804 11.2929 15.2929C11.4804 15.1054 11.7348 15 12 15C12.2652 15 12.5196 15.1054 12.7071 15.2929C12.8946 15.4804 13 15.7348 13 16C13 16.2652 12.8946 16.5196 12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17Z"/></svg>',
};

const CLOSE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const CONTAINER_ID = 'app-toast-container';
let toastSeq = 0;

const ensureContainer = () => {
  let el = document.getElementById(CONTAINER_ID);
  if (el) return el;
  el = document.createElement('div');
  el.id = CONTAINER_ID;
  el.className = 'toast-container';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-relevant', 'additions');
  document.body.appendChild(el);
  return el;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Lightweight toast notifications (DOM-based, no external library).
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} message
 * @param {(() => void)|null} [callback]
 * @param {number} [autoCloseTime=2000]
 * @returns {string|null} Toast element id
 */
export const showToast = (type, message, callback = null, autoCloseTime = 2000) => {
  if (typeof document === 'undefined') return null;

  const resolvedType = TOAST_COLORS[type] ? type : 'error';
  const color = TOAST_COLORS[resolvedType];
  const container = ensureContainer();
  const id = `toast-${++toastSeq}`;

  const toast = document.createElement('div');
  toast.id = id;
  toast.className = 'toast-item';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <button type="button" class="toast-item__close" aria-label="Cerrar">${CLOSE_ICON}</button>
    <div class="toast-item__body">
      <span class="toast-item__icon" style="color:${color}">${TOAST_ICONS[resolvedType]}</span>
      <p class="toast-item__message">${escapeHtml(message)}</p>
    </div>
    <div
      class="toast-item__progress"
      style="background:${color};animation-duration:${autoCloseTime}ms"
    ></div>
  `;

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    toast.classList.add('toast-item--out');
    window.setTimeout(() => {
      toast.remove();
      if (typeof callback === 'function') callback();
    }, 180);
  };

  toast.querySelector('.toast-item__close')?.addEventListener('click', close);
  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-item--in');
  });

  if (autoCloseTime > 0) {
    window.setTimeout(close, autoCloseTime);
  }

  return id;
};
