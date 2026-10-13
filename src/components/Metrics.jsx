import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import SectionWave from './SectionWave.jsx';
import { useInView } from '../hooks/useInView.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

const COUNT_DURATION = 1400;
const STAGGER = 160;

function useCountUp(target, active, delay) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    if (reducedMotion) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let startedAt = 0;
    const tick = (now) => {
      if (!startedAt) startedAt = now + delay;
      const t = Math.min(1, Math.max(0, (now - startedAt) / COUNT_DURATION));
      setValue(Math.round(target * (1 - (1 - t) ** 4)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, delay, reducedMotion]);

  return value;
}

function MetricItem({ metric, index, active, open, whyLabel, onToggle, onHover }) {
  const value = useCountUp(metric.value, active, index * STAGGER);
  const panelId = `metric-why-${metric.id}`;

  return (
    <li
      className={`metric${open ? ' is-open' : ''}`}
      style={{ '--i': index }}
      onPointerEnter={(event) => event.pointerType === 'mouse' && onHover(metric.id)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && onHover(null)}
    >
      <p className="metric__code" aria-hidden="true">
        <span className="metric__signal" />
        {metric.code}
      </p>
      <p className="metric__value">
        <span aria-hidden="true">
          {value}
          <span className="metric__suffix">{metric.suffix}</span>
        </span>
        <span className="visually-hidden">
          {metric.value}
          {metric.suffix}
        </span>
      </p>
      <h3 className="metric__title">{metric.title}</h3>
      <p className="metric__caption">{metric.caption}</p>

      {/* The whole card is the trigger (the button stretches over it). */}
      <button
        type="button"
        className="metric__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(metric.id)}
      >
        <span className="metric__toggle-icon" aria-hidden="true" />
        {whyLabel}
        <span className="visually-hidden">
          : {metric.value}
          {metric.suffix} {metric.title}
        </span>
      </button>

      <div id={panelId} className="metric__why" aria-hidden={!open} inert={!open}>
        <p>{metric.why}</p>
      </div>

      <span className="metric__ruler" aria-hidden="true" />
    </li>
  );
}

export default function Metrics({ intro, items, whyLabel }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  /* Click/tap pins a card open; on desktop, hovering also opens it. */
  const [pinned, setPinned] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!pinned) return undefined;
    const onKey = (event) => event.key === 'Escape' && setPinned(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pinned]);

  return (
    <section id="numeri" className="metrics" aria-labelledby="metrics-title">
      <div className="shell">
        <SectionHeader id="metrics-title" tone="dark" {...intro} />
        <p className="metrics__hint">
          <span className="metrics__hint-touch">{intro.hint}</span>
          <span className="metrics__hint-pointer">{intro.hintDesktop}</span>
        </p>
        <ul ref={ref} className={`metrics__grid${inView ? ' is-visible' : ''}`}>
          {items.map((metric, index) => (
            <MetricItem
              key={metric.id}
              metric={metric}
              index={index}
              active={inView}
              open={pinned === metric.id || hovered === metric.id}
              whyLabel={whyLabel}
              onToggle={(id) => setPinned((current) => (current === id ? null : id))}
              onHover={setHovered}
            />
          ))}
        </ul>
      </div>
      <SectionWave to="cream" />
    </section>
  );
}
