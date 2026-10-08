import { useState } from 'react';
import Logo from './Logo.jsx';
import LegalDialog from './LegalDialog.jsx';
import { toBinary, whatsappUrl } from '../utils/text.js';

export default function Footer({ brand, content, navigation, contact, legal }) {
  const [openId, setOpenId] = useState(null);
  const year = new Date().getFullYear();
  const entry = legal.find((item) => item.id === openId) ?? null;

  return (
    <footer className="footer">
      <div className="footer__inner shell">
        <div className="footer__brand">
          <Logo name={brand.name} className="logo--light" />
          <p className="footer__description">{brand.description}</p>
          <p className="footer__tagline">{content.tagline}</p>
        </div>

        <nav className="footer__col" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" className="footer__heading">
            {content.navTitle}
          </h2>
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__heading">{content.contactTitle}</h2>
          <ul>
            <li>
              <a href={whatsappUrl(contact.phoneE164, contact.whatsappGreeting)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneE164}`}>{contact.phoneDisplay}</a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h2 className="footer__heading">{content.legalTitle}</h2>
          <ul>
            {legal.map((item) => (
              <li key={item.id}>
                <button type="button" className="footer__link-button" onClick={() => setOpenId(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom shell">
        <p>
          © {year} {brand.name}. {content.rights}
        </p>
        <p className="footer__binary" aria-hidden="true">
          {toBinary(brand.name)}
        </p>
        <p>{content.signature}</p>
      </div>

      <LegalDialog entry={entry} onClose={() => setOpenId(null)} />
    </footer>
  );
}
