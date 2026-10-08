import { useEffect, useRef, useState } from 'react';
import ContactForm from './ContactForm.jsx';
import SectionHeader from './SectionHeader.jsx';
import { whatsappUrl } from '../utils/text.js';

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('copy failed');
}

export default function ContactSection({ content }) {
  const [copyState, setCopyState] = useState('idle');
  const resetTimer = useRef(0);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const onCopy = async () => {
    try {
      await copyText(content.phoneDisplay);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), 2600);
  };

  const copyMessage = { copied: content.copiedLabel, error: content.copyErrorLabel }[copyState] ?? '';

  return (
    <section id="contatti" className="contact" aria-labelledby="contact-title">
      <div className="contact__inner shell">
        <div className="contact__info">
          <SectionHeader
            id="contact-title"
            index={content.index}
            kicker={content.kicker}
            title={content.title}
            subtitle={content.subtitle}
          />

          <a
            className="button button--primary button--large contact__whatsapp"
            href={whatsappUrl(content.phoneE164, content.whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="contact__wa-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z" />
              <path d="M8.9 7.9c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .5-.2 1.2-.7 1.5-.5.4-1.3.6-2.1.4-1.6-.4-3-1.4-4.1-2.6-.9-1-1.6-2.2-1.7-3.4 0-.6.3-1.3.5-1.6Z" />
            </svg>
            {content.whatsappLabel}
          </a>

          <div className="phone">
            <span className="phone__label">Telefono</span>
            <a className="phone__number" href={`tel:${content.phoneE164}`}>
              {content.phoneDisplay}
            </a>
            <button type="button" className="phone__copy" onClick={onCopy}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="8" y="8" width="12" height="12" rx="2.5" />
                <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
              </svg>
              {content.copyLabel}
            </button>
            <p className={`phone__status is-${copyState}`} role="status">
              {copyMessage}
            </p>
          </div>
        </div>

        <ContactForm form={content.form} phoneE164={content.phoneE164} />
      </div>
    </section>
  );
}
