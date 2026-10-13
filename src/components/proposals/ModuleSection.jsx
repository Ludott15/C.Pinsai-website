import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from '../../hooks/useInView.js';
import { fillTemplate, whatsappUrl } from '../../utils/text.js';

/* "Modulo Eventi" in Italian, "Events Module" in English: the accent word can come first. */
const titleParts = (module) =>
  module.accentFirst ? [module.titleAccent, module.title] : [module.title, module.titleAccent];
const fullTitle = (module) => titleParts(module).filter(Boolean).join(' ');

/* Demo viewer: shows the module demo inside the card (iframe or video) once it exists. */
function DemoViewer({ module, demo }) {
  const source = module.demo;
  return (
    <figure className="module__demo">
      <div className="module__demo-bar" aria-hidden="true">
        <span />
        <span />
        <span />
        {module.code && <code>{module.code}</code>}
      </div>
      {source?.type === 'video' && (
        <video className="module__demo-frame" src={source.src} controls playsInline preload="metadata" />
      )}
      {source?.type === 'iframe' && (
        <iframe
          className="module__demo-frame"
          src={source.src}
          title={fillTemplate(demo.frameTitle, { module: fullTitle(module) })}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      {!source && <figcaption className="module__demo-pending">{demo.pending}</figcaption>}
    </figure>
  );
}

function ModuleCard({ module, selected, onToggle, request, demo }) {
  const [ref, inView] = useInView({ threshold: 0.08 });
  const titleId = `${module.id}-title`;

  return (
    <article
      ref={ref}
      id={`module-${module.id}`}
      className={`module${selected ? ' is-selected' : ''}${inView ? ' is-visible' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="module__main">
        <h3 id={titleId} className="module__title">
          {titleParts(module)
            .filter(Boolean)
            .map((part, index) => (
              <span key={part}>
                {index > 0 && ' '}
                {part === module.titleAccent ? <em>{part}</em> : part}
              </span>
            ))}
        </h3>
        {module.lead && <p className="module__lead">{module.lead}</p>}
        {module.paragraphs.map((paragraph) => (
          <p key={paragraph} className="module__text">
            {paragraph}
          </p>
        ))}

        {module.steps && (
          <ol className="module__steps">
            {module.steps.map((step, index) => (
              <li key={step.label}>
                <span className="module__step-num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="module__step-label">{step.label}</span>
                <span className="module__step-detail">{step.detail}</span>
              </li>
            ))}
          </ol>
        )}

        {module.features && (
          <div className="module__features">
            <p className="module__panel-label">{module.featuresLabel}</p>
            <ul>
              {module.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {module.example && <p className="module__example">{module.example}</p>}

        <button
          type="button"
          className="module__select"
          aria-pressed={selected}
          aria-describedby={titleId}
          onClick={() => onToggle(module.id)}
        >
          <span className="module__check" aria-hidden="true" />
          {selected ? request.selectedLabel : request.selectLabel}
        </button>
      </div>

      <DemoViewer module={module} demo={demo} />
    </article>
  );
}

/**
 * Request button, always bottom right: an icon (with the count once modules are chosen).
 * Opened, it explains how to ask for modules, or lists the chosen ones, each a link back
 * to its card, with the WhatsApp button.
 */
function RequestToast({ chosen, request, href }) {
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const panelId = useId();
  const count = chosen.length;

  /* A short pulse on the icon each time the selection changes. */
  useEffect(() => {
    if (!count) return undefined;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const goTo = (event, id) => {
    event.preventDefault();
    document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Rendered on <body>: an animated (transformed) ancestor would otherwise pin it to the card. */
  return createPortal(
    <>
      <p className="visually-hidden" role="status">
        {count ? fillTemplate(request.barSelected, { count }) : ''}
      </p>
      <div className={`request${open ? ' is-open' : ''}`}>
        {open && (
          <div id={panelId} className="request__panel">
            <p className="request__title">{request.panelTitle}</p>
            {count ? (
              <>
                <ul className="request__list">
                  {chosen.map((module) => (
                    <li key={module.id}>
                      <a href={`#module-${module.id}`} onClick={(event) => goTo(event, module.id)}>
                        {fullTitle(module)}
                        <span className="visually-hidden"> — {request.goTo}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a className="button button--primary request__send" href={href} target="_blank" rel="noopener noreferrer">
                  {request.sendLabel}
                  <span className="button__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </>
            ) : (
              <p className="request__empty">{request.emptyText}</p>
            )}
          </div>
        )}
        <button
          type="button"
          className={`request__toggle${bump ? ' is-bumping' : ''}`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={count ? fillTemplate(request.barSelected, { count }) : request.toggleLabel}
          onClick={() => setOpen((value) => !value)}
        >
          <svg className="request__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
          </svg>
          {count > 0 && (
            <span className="request__count" aria-hidden="true">
              {count}
            </span>
          )}
        </button>
      </div>
    </>,
    document.body,
  );
}

/**
 * A sector: bold title, then its modules. Modules can be selected and sent together
 * as a WhatsApp request with a pre-filled message.
 */
export default function ModuleSection({ section, request, demo, phone }) {
  const [selected, setSelected] = useState([]);
  const toggle = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const chosen = section.modules.filter((module) => selected.includes(module.id));
  const message = fillTemplate(request.message, {
    modules: chosen.map(fullTitle).join(', '),
    section: section.title,
  });

  return (
    <div className="modules">
      <h2 className="sector__title">{section.title}</h2>
      {section.description && (
        <div className="sector__description">
          {section.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
      <div className="modules__list">
        {section.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            selected={selected.includes(module.id)}
            onToggle={toggle}
            request={request}
            demo={demo}
          />
        ))}
      </div>

      <RequestToast chosen={chosen} request={request} href={whatsappUrl(phone, message)} />
    </div>
  );
}
