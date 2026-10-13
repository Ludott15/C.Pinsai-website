/**
 * Sends a contact message by email. First through the site's own function (/api/contact on
 * Vercel, Gmail SMTP); where that is not available (not configured, local dev) through
 * FormSubmit. Resolves when one of them accepted the message, rejects otherwise.
 */
export async function sendContact({ apiUrl, recipient, name, email, message, subject, website }) {
  const json = { 'Content-Type': 'application/json', Accept: 'application/json' };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ name, email, message, subject, website }),
    });
    if (response.ok) return;
    /* The function exists and refused the message itself: no point in trying elsewhere. */
    if (response.status === 400) throw new Error('invalid');
    /* 404 (no function), 405, 503 (not configured), 502 (provider down): try the fallback. */
  } catch (error) {
    if (error.message === 'invalid') throw error;
  }

  if (website) return;
  const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({
      name,
      email,
      message,
      _subject: subject,
      _replyto: email,
      _template: 'table',
      _captcha: 'false',
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || String(result.success) === 'false') throw new Error(result.message || 'send failed');
}
