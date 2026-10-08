import { useEffect, useRef, useState } from 'react';
import ServiceCard from './ServiceCard.jsx';
import { useInView } from '../../hooks/useInView.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/*
 * The shape of "your way of working": irregular blocks on a 6×4 grid.
 * `out` marks the blocks that a standard, square product cannot contain.
 */
const BLOCKS = [
  { col: '1 / 3', row: '1 / 2', out: true },
  { col: '3 / 4', row: '1 / 3', out: false },
  { col: '4 / 7', row: '2 / 3', out: true },
  { col: '1 / 2', row: '2 / 4', out: true },
  { col: '2 / 4', row: '3 / 4', out: false },
  { col: '5 / 6', row: '3 / 5', out: true },
  { col: '2 / 3', row: '4 / 5', out: false },
];

export default function TailoredService({ item }) {
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState(reducedMotion ? 'tailored' : 'standard');
  const touched = useRef(false);
  const [visualRef, inView] = useInView({ threshold: 0.5 });

  /* First time the visual is seen, the box re-tailors itself around the work: the concept in one gesture. */
  useEffect(() => {
    if (!inView || touched.current) return undefined;
    const id = setTimeout(() => setMode('tailored'), reducedMotion ? 0 : 900);
    return () => clearTimeout(id);
  }, [inView, reducedMotion]);

  const choose = (value) => {
    touched.current = true;
    setMode(value);
  };

  const { toggle } = item;

  return (
    <ServiceCard item={item} className="service--tailored">
      <p className="service__concept">{item.concept}</p>

      <p className="tailored__manifesto">
        <span>{item.manifesto[0]}</span> <strong>{item.manifesto[1]}</strong>
      </p>

      <div className="tailored__lab">
        <div className="tailored__toggle" role="group" aria-label={toggle.label}>
          {['standard', 'tailored'].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => choose(value)}
            >
              {toggle[value]}
            </button>
          ))}
        </div>

        <div ref={visualRef} className={`tailored__fit is-${mode}`} aria-hidden="true">
          <span className="tailored__frame" />
          {BLOCKS.map((block, index) => (
            <span
              key={index}
              className={`tailored__block${block.out ? ' is-out' : ''}`}
              style={{ gridColumn: block.col, gridRow: block.row, '--i': index }}
            />
          ))}
        </div>

        <p className="tailored__caption">
          {mode === 'tailored' ? toggle.tailoredCaption : toggle.standardCaption}
        </p>
        <code className="tailored__code">{item.code}</code>
      </div>
    </ServiceCard>
  );
}
