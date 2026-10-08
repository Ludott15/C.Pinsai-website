import { useCallback, useEffect, useMemo, useRef } from 'react';
import CoffeeVisual from './CoffeeVisual.jsx';
import ScrollDive from './ScrollDive.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollProgress } from '../hooks/useScrollProgress.js';
import { applyDiveState, clearDiveState } from '../utils/dive.js';
import { toBinary } from '../utils/text.js';

/** Vertical position of the coffee surface inside the cup visual box (see CoffeeVisual geometry). */
const COFFEE_CENTER_Y = 296 / 540;

export default function Hero({ content, dive, brandName }) {
  const trackRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const onProgress = useCallback((progress) => applyDiveState(trackRef.current, progress), []);
  useScrollProgress(trackRef, onProgress, !reducedMotion);

  useEffect(() => {
    if (reducedMotion && trackRef.current) clearDiveState(trackRef.current);
  }, [reducedMotion]);

  /* The dive opens from the centre of the coffee: keep its position (relative to the sticky stage) up to date. */
  useEffect(() => {
    const track = trackRef.current;
    if (reducedMotion || !track) return undefined;
    const stage = track.querySelector('.hero__stage');
    const cup = track.querySelector('.coffee');

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const cupRect = cup.getBoundingClientRect();
      track.style.setProperty('--cx', `${(cupRect.left - stageRect.left + cupRect.width / 2).toFixed(1)}px`);
      track.style.setProperty('--cy', `${(cupRect.top - stageRect.top + cupRect.height * COFFEE_CENTER_Y).toFixed(1)}px`);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(cup);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const lineB = content.headline[1];
  const accentAt = lineB.lastIndexOf(' ') + 1;
  const binaryRow = useMemo(() => Array(3).fill(toBinary(brandName)).join('  '), [brandName]);

  return (
    <section
      id="home"
      ref={trackRef}
      className={`hero${reducedMotion ? ' hero--static' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__stage">
        <div className="hero__binary" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} style={{ '--row': index }}>
              {binaryRow}
            </span>
          ))}
        </div>

        <div className="hero__grid shell">
          <p className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            {content.kicker}
          </p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__line hero__line--a">{content.headline[0]}</span>{' '}
            <span className="hero__line hero__line--b">
              {lineB.slice(0, accentAt)}
              <em>{lineB.slice(accentAt)}</em>
            </span>
          </h1>

          <div className="hero__visual">
            <CoffeeVisual brandName={brandName} />
          </div>

          <div className="hero__aside">
            <p className="hero__sub">{content.subheadline}</p>
            <a className="button button--primary hero__cta" href={content.cta.href}>
              {content.cta.label}
              <span className="button__arrow" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>

          <dl className="hero__ticket" aria-label="La tua ordinazione">
            {content.ticket.map((line) => (
              <div key={line.key}>
                <dt>{line.key}</dt>
                <dd>{line.value}</dd>
              </div>
            ))}
          </dl>

          <p className="hero__hint" aria-hidden="true">
            <span className="hero__hint-line" />
            {content.scrollHint}
          </p>
        </div>

        <ScrollDive {...dive} />
      </div>
    </section>
  );
}
