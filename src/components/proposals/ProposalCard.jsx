import { useInView } from '../../hooks/useInView.js';
import { useHref } from '../../pages/PageContext.jsx';

function Steps({ steps }) {
  return (
    <ol className="proposal__steps">
      {steps.map((step, index) => (
        <li key={step.label}>
          <span className="proposal__step-num" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="proposal__step-label">{step.label}</span>
          <span className="proposal__step-detail">{step.detail}</span>
        </li>
      ))}
    </ol>
  );
}

function Modules({ modules }) {
  return (
    <div className="proposal__modules">
      <p className="proposal__panel-label">{modules.title}</p>
      <ul>
        {modules.items.map((item, index) => (
          <li key={item}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Layers({ layers }) {
  return (
    <ol className="proposal__layers">
      {layers.map((layer) => (
        <li key={layer.id} className={layer.gem ? 'is-gem' : undefined}>
          <p className="proposal__layer-head">
            <span className="proposal__layer-level">{layer.level}</span>
            <span className="proposal__layer-name">{layer.name}</span>
            {layer.gem && (
              <span className="proposal__gem">
                <span aria-hidden="true">◆</span> {layer.gem}
              </span>
            )}
          </p>
          <p className="proposal__layer-lead">{layer.lead}:</p>
          <ul className="proposal__chips">
            {layer.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/**
 * Premium infrastructure card: the standard for every proposal.
 * Story on the left (title, lead, paragraphs, CTA), the "how it works" panel on the right.
 */
export default function ProposalCard({ card }) {
  const [ref, inView] = useInView({ threshold: 0.08 });
  const toHref = useHref();
  const titleId = `${card.id}-title`;
  const hasDetail = Boolean(card.steps || card.example || card.modules || card.layers);

  return (
    <article
      ref={ref}
      className={`proposal${hasDetail ? '' : ' proposal--single'}${inView ? ' is-visible' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="proposal__main">
        <p className="proposal__meta">
          <span className="proposal__index">{card.index}</span>
          <span className="proposal__kicker">{card.kicker}</span>
          {card.status && <span className="badge">{card.status}</span>}
          {card.placeholder && <span className="proposal__todo">Contenuto da inserire</span>}
        </p>
        <h3 id={titleId} className="proposal__title">
          {card.title}
          {card.titleAccent && <em>{card.titleAccent}</em>}
        </h3>
        {card.lead && <p className="proposal__lead">{card.lead}</p>}
        {card.paragraphs.map((paragraph) => (
          <p key={paragraph} className="proposal__text">
            {paragraph}
          </p>
        ))}
        <a className="proposal__cta" href={toHref(card.cta.href)} aria-describedby={titleId}>
          {card.cta.label}
          <span className="proposal__cta-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

      {hasDetail && (
        <div className="proposal__detail">
          {card.steps && <Steps steps={card.steps} />}
          {card.modules && <Modules modules={card.modules} />}
          {card.layers && <Layers layers={card.layers} />}
          {card.example && (
            <figure className="proposal__example">
              <figcaption>{card.example.label}</figcaption>
              <p>{card.example.text}</p>
            </figure>
          )}
        </div>
      )}
    </article>
  );
}
