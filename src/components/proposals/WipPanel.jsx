import { whatsappUrl } from '../../utils/text.js';

/** A sector still in the works: an illustrated "work in progress" card. */
export default function WipPanel({ section, phone }) {
  return (
    <article className="wip" aria-labelledby={`${section.id}-title`}>
      <svg className="wip__art" viewBox="0 0 320 200" aria-hidden="true">
        <defs>
          <pattern id="wip-stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <rect width="14" height="28" fill="#E04A95" />
            <rect x="14" width="14" height="28" fill="#4B2D20" />
          </pattern>
        </defs>
        <ellipse cx="160" cy="176" rx="132" ry="12" fill="#4B2D20" opacity=".12" />
        <rect x="40" y="96" width="240" height="26" rx="6" fill="url(#wip-stripes)" />
        <rect x="58" y="122" width="10" height="54" rx="3" fill="#4B2D20" />
        <rect x="252" y="122" width="10" height="54" rx="3" fill="#4B2D20" />
        <path className="wip__cone" d="M110 176 L126 120 L138 120 L154 176 Z" fill="#E04A95" />
        <rect className="wip__cone" x="118" y="146" width="28" height="8" fill="#FBF8F1" />
        <path className="wip__cone wip__cone--b" d="M196 176 L210 128 L220 128 L234 176 Z" fill="#E04A95" />
        <rect className="wip__cone wip__cone--b" x="203" y="150" width="24" height="7" fill="#FBF8F1" />
        <circle className="wip__light" cx="160" cy="60" r="16" fill="#E04A95" />
        <rect x="156" y="74" width="8" height="22" rx="2" fill="#4B2D20" />
      </svg>
      <div className="wip__copy">
        <span className="badge">{section.badge}</span>
        <h2 id={`${section.id}-title`} className="sector__title">
          {section.title}
        </h2>
        <p>{section.text}</p>
        <a
          className="button button--primary"
          href={whatsappUrl(phone, section.cta.message)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {section.cta.label}
        </a>
      </div>
    </article>
  );
}
