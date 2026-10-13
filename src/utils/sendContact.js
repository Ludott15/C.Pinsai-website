/** Name of the form registered with Netlify Forms (see the hidden form in index.html). */
export const FORM_NAME = 'contatti';

const encode = (fields) => new URLSearchParams(fields).toString();

/**
 * Sends a contact message. The site is hosted on Netlify: the message is posted to Netlify Forms,
 * which stores it and emails it to the address set in the Netlify dashboard (Forms → notifications).
 * Where Netlify is not available (local dev, another host) it falls back to FormSubmit.
 * Resolves when one of them accepted the message, rejects otherwise.
 */
export async function sendContact({ recipient, name, email, message, subject, language, website }) {
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': FORM_NAME, name, email, message, subject, language, 'bot-field': website }),
    });
    /* Netlify answers 200 with its own page; other hosts answer 404/405 to a POST on "/". */
    if (response.ok) return;
  } catch {
    /* Network error: try the fallback. */
  }

  const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name, email, message, _subject: subject, _replyto: email, _captcha: 'false' }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || String(result.success) === 'false') throw new Error(result.message || 'send failed');
}
