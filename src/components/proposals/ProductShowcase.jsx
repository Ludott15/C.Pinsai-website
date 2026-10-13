import { useInView } from '../../hooks/useInView.js';
import { whatsappUrl } from '../../utils/text.js';
import FeatureVisual from './FeatureVisual.jsx';
import WipPanel from './WipPanel.jsx';

function Feature({ feature, index }) {
  const [ref, inView] = useInView({ threshold: 0.25 });

  return (
    <li ref={ref} className={`feature${inView ? ' is-visible' : ''}`}>
      <div className="feature__copy">
        <p className="feature__num" aria-hidden="true">
          {feature.level ?? String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="feature__title">
          {feature.title}
          {feature.gem && (
            <span className="feature__gem">
              <span aria-hidden="true">◆</span> {feature.gem}
            </span>
          )}
        </h3>
        <p className="feature__text">{feature.text}</p>
        {feature.items && (
          <ul className="feature__items">
            {feature.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      <FeatureVisual feature={feature} />
    </li>
  );
}

/**
 * Product-style presentation for the subscription services (SegretarIA, Palestre):
 * a framed page you scroll through, one feature at a time.
 */
export default function ProductShowcase({ section, phone }) {
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });

  return (
    <article className="product" aria-labelledby={`${section.id}-name`}>
      <header ref={heroRef} className={`product__hero${heroInView ? ' is-visible' : ''}`}>
        {section.status && (
          <p className="product__meta">
            <span className="badge">{section.status}</span>
          </p>
        )}
        <h2 id={`${section.id}-name`} className="product__name">
          {section.name}
          {section.nameAccent && <em className={section.accent === 'rose' ? 'is-rose' : undefined}>{section.nameAccent}</em>}
        </h2>
        <p className="product__lead">{section.lead}</p>
        {section.intro && <p className="product__intro">{section.intro}</p>}
        {section.disclaimer && (
          <aside className="product__hitl">
            <p className="product__hitl-title">
              <span className="product__hitl-dot" aria-hidden="true" />
              {section.disclaimer.title}
            </p>
            <p>{section.disclaimer.text}</p>
          </aside>
        )}
      </header>

      {section.features && (
        <ol className="product__features">
          {section.features.map((feature, index) => (
            <Feature key={feature.id} feature={feature} index={index} />
          ))}
        </ol>
      )}

      {section.wip && <WipPanel section={{ id: `${section.id}-wip`, ...section.wip }} phone={phone} />}

      {section.example && <p className="product__example">{section.example}</p>}

      {section.closing && (
        <section className="product__closing" aria-labelledby={`${section.id}-closing`}>
          <h3 id={`${section.id}-closing`}>{section.closing.title}</h3>
          <p>{section.closing.text}</p>
        </section>
      )}

      {section.cta && (
      <a
        className="button button--primary button--large product__cta"
        href={whatsappUrl(phone, section.cta.message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {section.cta.label}
        <span className="button__arrow" aria-hidden="true">
          →
        </span>
      </a>
      )}
    </article>
  );
}
