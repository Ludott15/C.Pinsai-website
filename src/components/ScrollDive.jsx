import { useMemo } from 'react';
import { createRandom } from '../utils/text.js';

const COLUMNS = 14;

/**
 * Section 03 — the moment the camera falls into the cup.
 * The coffee portal (rendered by CoffeeVisual) fills the screen; this layer adds the narrative:
 * CAFFÈ → PROFONDITÀ → CODICE → AI, lighting up one step at a time with the scroll.
 */
export default function ScrollDive({ label, title, steps }) {
  const columns = useMemo(() => {
    const random = createRandom(42);
    return Array.from({ length: COLUMNS }, (_, index) => ({
      id: index,
      bits: Array.from({ length: 18 }, () => (random() > 0.5 ? '1' : '0')).join(''),
      style: {
        '--col': index,
        '--fall': `${(9 + random() * 8).toFixed(1)}s`,
        '--start': `${(-random() * 12).toFixed(1)}s`,
        '--alpha': (0.08 + random() * 0.22).toFixed(2),
      },
    }));
  }, []);

  return (
    <div className="dive">
      <div className="dive__rain" aria-hidden="true">
        {columns.map((column) => (
          <span key={column.id} style={column.style}>
            {column.bits}
          </span>
        ))}
      </div>

      <div className="dive__copy shell">
        <p className="dive__label">
          <span className="mono">03</span> {label}
        </p>
        <p className="dive__title">{title}</p>
        <ol className="dive__steps">
          {steps.map((step, index) => (
            <li key={step} style={{ '--i': index }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
