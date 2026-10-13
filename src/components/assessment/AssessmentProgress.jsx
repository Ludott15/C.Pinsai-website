import { useUi } from '../../pages/PageContext.jsx';
import { fillTemplate } from '../../utils/text.js';

const stateLabel = (index, current, selections, t) => {
  if (index === current) return t.current;
  return selections[index] === null ? t.todo : t.done;
};

/**
 * Segmented progress. The bonus question is never announced: its segment only appears
 * (growing in) when the bonus question itself is on screen.
 */
export default function AssessmentProgress({ current, segments, selections, label, microcopy, bonus }) {
  const t = useUi().progress;
  return (
    <div className="progress">
      <div className="progress__head">
        <p className={`progress__label${bonus ? ' is-bonus' : ''}`}>{label}</p>
        <p className="progress__micro">{microcopy}</p>
      </div>
      <ol
        className="progress__segments"
        aria-label={t.label}
        style={{ '--segments': segments }}
      >
        {Array.from({ length: segments }, (_, index) => {
          const state = index === current ? 'current' : selections[index] === null ? 'todo' : 'done';
          const isBonus = bonus && index === segments - 1;
          return (
            <li
              key={index}
              className={`progress__segment is-${state}${isBonus ? ' is-bonus' : ''}`}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="visually-hidden">
                {isBonus ? t.bonus : fillTemplate(t.question, { n: index + 1 })}: {stateLabel(index, current, selections, t)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
