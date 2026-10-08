const stateLabel = (index, current, selections) => {
  if (index === current) return 'in corso';
  return selections[index] === null ? 'da completare' : 'completata';
};

export default function AssessmentProgress({ current, total, selections, label, microcopy }) {
  return (
    <div className="progress">
      <div className="progress__head">
        <p className="progress__label">{label}</p>
        <p className="progress__micro">{microcopy}</p>
      </div>
      <ol className="progress__segments" aria-label="Avanzamento del Coffee Check">
        {Array.from({ length: total }, (_, index) => {
          const state = index === current ? 'current' : selections[index] === null ? 'todo' : 'done';
          return (
            <li
              key={index}
              className={`progress__segment is-${state}`}
              aria-current={index === current ? 'step' : undefined}
            >
              <span className="visually-hidden">
                Domanda {index + 1}: {stateLabel(index, current, selections)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
