import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
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

function MetricItem({ metric, index, active }) {
  const value = useCountUp(metric.value, active, index * STAGGER);

  return (
    <li className="metric" style={{ '--i': index }}>
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
      <span className="metric__ruler" aria-hidden="true" />
    </li>
  );
}

export default function Metrics({ intro, items }) {
  const [ref, inView] = useInView({ threshold: 0.3 });

  return (
    <section id="numeri" className="metrics" aria-labelledby="metrics-title">
      <div className="shell">
        <SectionHeader id="metrics-title" tone="dark" {...intro} />
        <ul ref={ref} className={`metrics__grid${inView ? ' is-visible' : ''}`}>
          {items.map((metric, index) => (
            <MetricItem key={metric.id} metric={metric} index={index} active={inView} />
          ))}
        </ul>
      </div>
    </section>
  );
}
