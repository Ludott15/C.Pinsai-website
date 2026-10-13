import { useEffect, useId, useState } from 'react';
import { useInView } from '../../hooks/useInView.js';
import { fillTemplate, whatsappUrl } from '../../utils/text.js';

/* Demo viewer: shows the module demo inside the card (iframe or video) once it exists. */
function DemoViewer({ module, demo }) {
  const source = module.demo;
  return (
    <figure className="module__demo">
      <div className="module__demo-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {source?.type === 'video' && (
        <video className="module__demo-frame" src={source.src} controls playsInline preload="metadata" />
      )}
      {source?.type === 'iframe' && (
        <iframe
          className="module__demo-frame"
          src={source.src}
          title={fillTemplate(demo.frameTitle, { module: module.title })}
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
      className={`module${selected ? ' is-selected' : ''}${inView ? ' is-visible' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="module__main">
        <h3 id={titleId} className="module__title">
          {module.title}
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
 * Floating request, bottom right: appears once a module is selected, as a small chip
 * with the count. Clicked, it opens to list the modules and send them on WhatsApp.
 */
function RequestToast({ chosen, request, href }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const count = chosen.length;

  useEffect(() => {
    if (!count) setOpen(false);
  }, [count]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <p className="visually-hidden" role="status">
        {count ? fillTemplate(request.barSelected, { count }) : ''}
      </p>
      <div className={`request${open ? ' is-open' : ''}`} hidden={!count}>
        {open && (
          <div id={panelId} className="request__panel">
            <p className="request__title">{request.panelTitle}</p>
            <ul className="request__list">
              {chosen.map((module) => (
                <li key={module.id}>{module.title}</li>
              ))}
            </ul>
            <a className="button button--primary request__send" href={href} target="_blank" rel="noopener noreferrer">
              {request.sendLabel}
              <span className="button__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        )}
        <button
          type="button"
          className="request__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <svg className="request__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
          </svg>
          <span className="request__label">{fillTemplate(request.barSelected, { count })}</span>
          <span className="request__chevron" aria-hidden="true" />
        </button>
      </div>
    </>
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
    modules: chosen.map((module) => module.title).join(', '),
    section: section.title,
  });

  return (
    <div className="modules">
      <h2 className="sector__title">{section.title}</h2>
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
