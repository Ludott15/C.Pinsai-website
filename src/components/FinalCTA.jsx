import { useInView } from '../hooks/useInView.js';

export default function FinalCTA({ content }) {
  const [ref, inView] = useInView({ threshold: 0.35 });

  return (
    <section ref={ref} className={`final${inView ? ' is-visible' : ''}`} aria-labelledby="final-title">
      <div className="final__rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="final__inner shell">
        <p className="kicker kicker--dark">
          <span className="kicker__index">{content.index}</span>
          {content.kicker}
        </p>
        <h2 id="final-title" className="final__title">
          {content.headline}
        </h2>
        <p className="final__sub">{content.subheadline}</p>
        <a className="button button--primary button--large final__cta" href={content.cta.href}>
          {content.cta.label}
          <span className="button__arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
