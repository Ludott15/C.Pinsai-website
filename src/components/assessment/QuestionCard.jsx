import QuestionVisual from './QuestionVisual.jsx';

const LETTERS = 'ABCDEFGH';

export default function QuestionCard({ question, selected, picking, onSelect, ui, onBack, onNext }) {
  const headingId = `question-${question.id}`;

  return (
    <div className={`question question--${question.visual}`}>
      <div className="question__context">
        <p className="question__category">
          <span className="question__category-name">{question.category}</span>
          <span className="question__category-label">{question.label}</span>
        </p>
        <QuestionVisual
          type={question.visual}
          level={selected}
          answers={question.answers}
          selectionMicrocopy={question.selectionMicrocopy}
        />
      </div>

      <div className="question__main">
        <h3 id={headingId} className="question__text" tabIndex={-1} data-autofocus>
          {question.question}
        </h3>

        <ul className="answers" aria-labelledby={headingId} data-count={question.answers.length}>
          {question.answers.map((answer, index) => {
            const isSelected = selected === index;
            return (
              <li key={answer.label}>
                <button
                  type="button"
                  className={`answer${isSelected ? ' is-selected' : ''}${isSelected && picking ? ' is-picking' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelect(index)}
                >
                  <span className="answer__key" aria-hidden="true">
                    {LETTERS[index]}
                  </span>
                  <span className="answer__label">{answer.label}</span>
                  <span className="answer__check" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="question__nav">
          <button type="button" className="text-button" onClick={onBack}>
            <span aria-hidden="true">←</span> {ui.backLabel}
          </button>
          {selected !== null && !picking && (
            <button type="button" className="text-button text-button--accent" onClick={onNext}>
              {ui.nextLabel} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
