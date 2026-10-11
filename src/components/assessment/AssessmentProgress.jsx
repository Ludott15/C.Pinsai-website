const stateLabel = (index, current, selections) => {
  if (index === current) return 'in corso';
  return selections[index] === null ? 'da completare' : 'completata';
};

/**
 * Segmented progress. The bonus question is never announced: its segment only appears
 * (growing in) when the bonus question itself is on screen.
 */
export default function AssessmentProgress({ current, segments, selections, label, microcopy, bonus }) {
  return (
    <div className="progress">
      <div className="progress__head">
        <p className={`progress__label${bonus ? ' is-bonus' : ''}`}>{label}</p>
        <p className="progress__micro">{microcopy}</p>
      </div>
      <ol
        className="progress__segments"
        aria-label="Avanzamento del Coffee Check"
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
                {isBonus ? 'Domanda bonus' : `Domanda ${index + 1}`}: {stateLabel(index, current, selections)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
