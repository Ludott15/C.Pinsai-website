import nodemailer from 'nodemailer';

/*
 * Contact form → email (Vercel serverless function, POST /api/contact).
 *
 * Sends the message through the Gmail account set in the project's environment variables:
 *   GMAIL_USER          the sending address (e.g. cpinsai02@gmail.com)
 *   GMAIL_APP_PASSWORD  a Google "app password" for that account (not the normal password)
 *   CONTACT_TO          optional: where messages go (default cpinsai02@gmail.com)
 * Without them it answers 503 and the page falls back to FormSubmit.
 */

const DEFAULT_TO = 'cpinsai02@gmail.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 120, email: 200, message: 5000 };

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return res.status(503).json({ ok: false, error: 'not_configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  /* Honeypot: a field people never see. Bots fill it; pretend all went well. */
  if (body.website) return res.status(200).json({ ok: true });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const message = clean(body.message, LIMITS.message);
  const subject = clean(body.subject, 160) || 'Nuovo messaggio dal sito C.PINSAI';
  if (name.length < 2 || !EMAIL_PATTERN.test(email) || message.length < 10) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  try {
    await transporter.sendMail({
      from: `"Sito C.PINSAI" <${GMAIL_USER}>`,
      to: CONTACT_TO || DEFAULT_TO,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      subject,
      text: `Nome: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Nome:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('contact: send failed', error);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
}
