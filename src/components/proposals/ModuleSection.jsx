import { useState } from 'react';
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
        <code>{module.code}</code>
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
        <p className="module__meta">
          <code className="module__code">{module.code}</code>
        </p>
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

      <div className={`request${chosen.length ? ' is-ready' : ''}`}>
        <p className="request__status" role="status">
          {chosen.length ? fillTemplate(request.barSelected, { count: chosen.length }) : request.barEmpty}
        </p>
        {chosen.length > 0 && (
          <a
            className="button button--primary request__send"
            href={whatsappUrl(phone, message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {request.sendLabel}
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
