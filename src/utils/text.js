/** Replaces `{key}` tokens with the matching value from `values`. */
export const fillTemplate = (template, values) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));

/** Encodes a string as space-separated 8-bit binary groups (ASCII range). */
export const toBinary = (text) =>
  Array.from(text, (char) => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

/** Deterministic pseudo-random generator (mulberry32) so decorative layouts stay stable between renders. */
export const createRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const whatsappUrl = (phoneE164, text) =>
  `https://wa.me/${phoneE164.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
