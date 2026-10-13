import { useHref, useUi } from '../../pages/PageContext.jsx';

export default function AssessmentResult({ result, profile, questions, selections, onRestart, restartLabel }) {
  const toHref = useHref();
  const ui = useUi();

  return (
    <div className="result">
      <div className="result__head">
        <h3 className="result__title" tabIndex={-1} data-autofocus>
          {result.title}
        </h3>
        <p className="result__subtitle">{result.subtitle}</p>
      </div>

      <div className="result__body">
        <article className="receipt" aria-label={result.receiptTitle}>
          <p className="receipt__head">
            <span>C.PINSAI</span>
            <span>{result.receiptTitle}</span>
          </p>
          <dl className="receipt__lines">
            {questions.map((question, index) => (
              <div key={question.id}>
                <dt>{question.category}</dt>
                <dd>{question.answers[selections[index]]?.label}</dd>
              </div>
            ))}
          </dl>
          <p className="receipt__foot" aria-hidden="true">
            {ui.receiptFoot}
          </p>
        </article>

        <div className="result__profile">
          <p className="result__profile-label">{result.profileLabel}</p>
          <p className="result__profile-title">{profile.title}</p>
          <p className="result__copy">{profile.copy}</p>
          <p className="result__quote">{profile.quote}</p>
        </div>
      </div>

      <div className="result__next">
        <p className="result__question">{result.nextQuestion}</p>
        <div className="result__actions">
          <a className="button button--primary" href={toHref(result.primaryCta.href)}>
            {result.primaryCta.label}
          </a>
          <a className="button button--ghost-light" href={toHref(result.secondaryCta.href)}>
            {result.secondaryCta.label}
          </a>
          <button type="button" className="text-button" onClick={onRestart}>
            ↺ {restartLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
