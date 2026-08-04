/**
 * Client-side validation hook and rule engine for form fields.
 */
import { useCallback, useState } from 'react';
import { showToast } from '../utils/alerts';

const keysFrom = (validations) => Object.keys(validations);

/**
 * Form validation hook: binds rules to field values and exposes validate / resetMessages.
 * @param {object} validations - Map of field key → { value, rules, setMessage, message }
 */
export function useValidator(validations) {
  const keys = keysFrom(validations);
  const [messages, setMessages] = useState(() => Object.fromEntries(keys.map((k) => [k, ''])));

  const setMessageForKey = useCallback((key, msgOrUpdater) => {
    setMessages((prev) => ({
      ...prev,
      [key]: typeof msgOrUpdater === 'function' ? msgOrUpdater(prev[key] ?? '') : msgOrUpdater,
    }));
  }, []);

  const result = {};
  for (const key of keys) {
    result[key] = {
      ...validations[key],
      message: messages[key],
      setMessage: (msgOrUpdater) => setMessageForKey(key, msgOrUpdater),
    };
  }

  // showErrorsIn: 'input' | 'toast' | 'both'
  const validate = (showErrorsIn = 'input') => validator(result, showErrorsIn);

  const resetMessages = useCallback(() => {
    setMessages((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, ''])));
  }, []);

  return { ...result, validate, resetMessages };
}

/**
 * Runs all validation rules; optionally shows errors on inputs and/or toasts.
 * @param {object} validations
 * @param {'input'|'toast'|'both'} [showErrorsIn='input']
 * @returns {boolean} Whether all fields passed
 */
export function validator(validations, showErrorsIn = 'input') {
  const showInInput = showErrorsIn === 'input' || showErrorsIn === 'both';
  const showInToast = showErrorsIn === 'toast' || showErrorsIn === 'both';

  const messages = [];
  let valid = true;
  for (const key in validations) {
    const field = validations[key];
    if (showInInput && field.setMessage) {
      field.setMessage('');
    }
    let valid_field = false;

    for (let j = 0; j < field.rules.length; j++) {
      const rules = field.rules[j];
      let valid_rules = true;

      for (const rule in rules) {
        const fn = comparator[rule];
        if (typeof fn !== 'function') {
          console.warn(
            `useValidator: regla "${rule}" no existe en comparator. Reglas válidas:`,
            Object.keys(comparator)
          );
          continue;
        }
        if (!fn(field.value, rules[rule][0])) {
          valid_rules = false;
          const errorMsg = rules[rule][1];
          messages.push(errorMsg);
          if (showInInput && field.setMessage) {
            field.setMessage((m) => `${m}${errorMsg} `);
          }
        }
      }

      if (valid_rules) {
        valid_field = true;
        if (showInInput && field.setMessage) {
          field.setMessage('');
        }
        break;
      }
    }

    if (!valid_field) {
      valid = false;
    }
  }

  if (showInToast) {
    messages.forEach((message) => {
      showToast('warning', message);
    });
  }
  return valid;
}

/** Built-in rule predicates keyed by rule name (required, regex, greater, etc.). */
export const comparator = {
  required: (x) => x !== '' && x !== null && x !== undefined,
  length: (x, length) => x.length === length,
  minlength: (x, length) => x.length >= length,
  maxlength: (x, length) => x.length <= length,
  equal: (x, y) => x !== '' && x === y,
  distinct: (x, y) => x !== y,
  greater: (x, y) => x > y,
  smaller: (x, y) => x !== '' && x < y,
  email: (x) => (x !== '' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) : false),
  regex: (x, y) => (x !== '' ? y.test(x) : false),
};
