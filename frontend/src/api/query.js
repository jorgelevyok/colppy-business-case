/**
 * Shared HTTP client for the frontend. Wraps fetch with base URL, JSON handling,
 * normalized success/error shapes, and optional error toasts.
 */
import { showToast } from '../utils';

const getBaseUrl = () => import.meta.env.VITE_BASE_URL || '';

const isAbsoluteUrl = (url) =>
  typeof url === 'string' && /^(https?:\/\/|\/\/|www\.)/i.test(url.trim());

const buildHeaders = (multipart) =>
  multipart
    ? {}
    : {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      };

const NETWORK_ERROR_MESSAGES = new Set([
  'failed to fetch',
  'networkerror when attempting to fetch resource',
  'network request failed',
  'load failed',
]);

const GENERIC_RETRY_MESSAGE =
  'Ocurrió un error. Intentá nuevamente más tarde.';

/**
 * Extracts a user-facing message from assorted API error/success JSON shapes.
 * @param {object|null} json - Parsed response body.
 * @param {string} [fallback] - Message when nothing usable is found.
 * @returns {string}
 */
export const resolveApiMessage = (json, fallback = GENERIC_RETRY_MESSAGE) => {
  if (json == null) return fallback;

  const candidates = [
    json.message,
    json.messages,
    json.error?.message,
    json.error?.messages,
    json.messages?.message,
    json.data?.message,
  ];

  for (const candidate of candidates) {
    if (candidate == null) continue;
    if (typeof candidate === 'string' && candidate.trim()) {
      const normalized = candidate.trim();
      if (NETWORK_ERROR_MESSAGES.has(normalized.toLowerCase())) {
        return GENERIC_RETRY_MESSAGE;
      }
      return normalized;
    }
    if (typeof candidate === 'object') {
      if (typeof candidate.es === 'string' && candidate.es.trim()) return candidate.es.trim();
      if (typeof candidate.message === 'string' && candidate.message.trim()) {
        return candidate.message.trim();
      }
      if (typeof candidate.message?.es === 'string' && candidate.message.es.trim()) {
        return candidate.message.es.trim();
      }
      if (Array.isArray(candidate) && candidate.length) {
        return candidate
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item?.es) return item.es;
            return null;
          })
          .filter(Boolean)
          .join('. ');
      }
    }
  }

  if (Array.isArray(json) && json.length && typeof json[0] === 'string') {
    return json.join('. ');
  }

  return fallback;
};

const humanizeNetworkError = () => GENERIC_RETRY_MESSAGE;

const handlerResponse = async (response, { showErrorAlert = true } = {}) => {
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  const hasExplicitError =
    json?.success === false ||
    json?.error === true ||
    (json?.error != null && typeof json.error === 'object');

  if (!response.ok || hasExplicitError) {
    const message = resolveApiMessage(json, GENERIC_RETRY_MESSAGE);
    if (showErrorAlert) showToast('error', message);
    return {
      success: false,
      error: message,
      data: null,
      status: response.status,
      message,
    };
  }

  const message = resolveApiMessage(json, null);
  return {
    success: true,
    data: json?.data,
    status: response.status,
    message: message || json?.data?.message || null,
  };
};

const request = async ({
  action = 'GET',
  url,
  body = null,
  multipart = false,
  signal,
  showErrorAlert = true,
} = {}) => {
  const baseUrl = getBaseUrl();
  if (!isAbsoluteUrl(url) && !baseUrl) {
    const message =
      'No está configurada la URL del servidor. Revisá VITE_BASE_URL.';
    if (showErrorAlert) showToast('error', message);
    return { success: false, error: message, data: null, message };
  }

  const urlService = isAbsoluteUrl(url)
    ? url
    : baseUrl + url.replace(/^\//, '');

  try {
    const fetchResponse = await fetch(urlService, {
      method: action,
      mode: 'cors',
      cache: 'no-cache',
      headers: buildHeaders(multipart),
      ...(signal && { signal }),
      ...(action !== 'GET' &&
        action !== 'DELETE' &&
        body && { body: multipart ? body : JSON.stringify(body) }),
    });
    return await handlerResponse(fetchResponse, { showErrorAlert });
  } catch (error) {
    if (error?.name === 'AbortError') {
      const message = 'La solicitud fue cancelada';
      if (showErrorAlert) showToast('error', message);
      return { success: false, error: message, data: null, message };
    }
    const message = humanizeNetworkError();
    if (showErrorAlert) showToast('error', message);
    return { success: false, error: message, data: null, message };
  }
};

/** HTTP verb helpers; each returns `{ success, data, error, message, status? }`. */
export const query = {
  get: (url, options = {}) => request({ action: 'GET', url, ...options }),
  post: (url, body, options = {}) =>
    request({ action: 'POST', url, body, ...options }),
  put: (url, body, options = {}) =>
    request({ action: 'PUT', url, body, ...options }),
  delete: (url, options = {}) => request({ action: 'DELETE', url, ...options }),
};
