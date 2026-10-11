import { useInView } from '../hooks/useInView.js';
import { useHref } from '../pages/PageContext.jsx';

/** "Le nostre proposte": the door from the solutions to the infrastructures page. */
export default function ProposalsTeaser({ content }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const toHref = useHref();

  return (
    <section ref={ref} className={`teaser${inView ? ' is-visible' : ''}`} aria-labelledby="teaser-title">
      <div className="teaser__inner shell">
        <div className="teaser__copy">
          <h2 id="teaser-title" className="teaser__title">
            {content.title}
          </h2>
          <p className="teaser__text">{content.text}</p>
        </div>
        <a className="button button--primary button--large teaser__cta" href={toHref(content.cta.href)}>
          {content.cta.label}
          <span className="button__arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
