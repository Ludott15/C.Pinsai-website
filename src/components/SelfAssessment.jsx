import { useCallback, useEffect, useRef, useState } from 'react';
import QuestionCard from './assessment/QuestionCard.jsx';
import AssessmentProgress from './assessment/AssessmentProgress.jsx';
import AssessmentResult from './assessment/AssessmentResult.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { computeScore, findProfile } from '../utils/assessment.js';
import { fillTemplate } from '../utils/text.js';

/** Time the selected answer stays on screen (check mark + pulse) before moving on. */
const PICK_DELAY = 420;
/** Must match the duration of the `.check__stage.is-leaving` animation in assessment.css. */
const LEAVE_DURATION = 360;
const LEAVE_DURATION_MOBILE = 240;

const leaveDuration = (reducedMotion) => {
  if (reducedMotion) return 0;
  return window.matchMedia('(max-width: 640px)').matches ? LEAVE_DURATION_MOBILE : LEAVE_DURATION;
};

export default function SelfAssessment({ data }) {
  const { intro, ui, questions, result } = data;
  const total = questions.length;

  const [stage, setStage] = useState('intro');
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState(() => Array(total).fill(null));
  const [leaving, setLeaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const reducedMotion = useReducedMotion();
  const timers = useRef([]);
  const busy = useRef(false);
  const panelRef = useRef(null);
  const interacted = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (callback, delay) => {
    timers.current.push(setTimeout(callback, delay));
  };

  const bringIntoView = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const { top } = panel.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.4) {
      panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [reducedMotion]);

  /** After every user-driven change, focus lands on the new content so keyboard and screen reader users follow along. */
  useEffect(() => {
    if (!interacted.current) return;
    panelRef.current?.querySelector('[data-autofocus]')?.focus({ preventScroll: true });
    bringIntoView();
  }, [stage, current, bringIntoView]);

  /** Plays the exit animation, then swaps the content and lets the entry animation run. */
  const transition = (apply) => {
    interacted.current = true;
    busy.current = true;
    setLeaving(true);
    later(() => {
      apply();
      setLeaving(false);
      setPicking(false);
      busy.current = false;
    }, leaveDuration(reducedMotion));
  };

  const showQuestion = (index) => {
    setStage('quiz');
    setCurrent(index);
    const question = questions[index];
    setAnnouncement(
      `${fillTemplate(ui.progressLabel, { current: index + 1, total })}. ${question.microcopy}`,
    );
  };

  const showResult = (finalSelections) => {
    const profile = findProfile(result.profiles, computeScore(questions, finalSelections));
    setStage('result');
    setAnnouncement(`${result.title} ${result.profileLabel}: ${profile.title}.`);
  };

  const start = () => {
    if (busy.current) return;
    transition(() => showQuestion(0));
  };

  const goForward = (finalSelections) => {
    transition(() => {
      if (current + 1 < total) showQuestion(current + 1);
      else showResult(finalSelections);
    });
  };

  const select = (answerIndex) => {
    if (busy.current) return;
    busy.current = true;
    const next = selections.map((value, index) => (index === current ? answerIndex : value));
    setSelections(next);
    setPicking(true);
    later(() => goForward(next), reducedMotion ? 120 : PICK_DELAY);
  };

  const goBack = () => {
    if (busy.current) return;
    transition(() => {
      if (current === 0) {
        setStage('intro');
        setAnnouncement(intro.title);
      } else {
        showQuestion(current - 1);
      }
    });
  };

  const goNext = () => {
    if (busy.current || selections[current] === null) return;
    goForward(selections);
  };

  const restart = () => {
    if (busy.current) return;
    transition(() => {
      setSelections(Array(total).fill(null));
      showQuestion(0);
    });
  };

  const score = computeScore(questions, selections);
  const profile = findProfile(result.profiles, score);

  return (
    <section id="coffee-check" className="check" aria-labelledby="check-title">
      <div className="check__inner shell">
        <header className="check__intro">
          <p className="kicker kicker--dark">
            <span className="kicker__index">{intro.index}</span>
            {intro.kicker}
          </p>
          <h2 id="check-title" className="check__title">
            {intro.title}
          </h2>
          <p className="check__concept">{intro.concept}</p>
        </header>

        <div ref={panelRef} className="check__panel">
          <p className="visually-hidden" aria-live="polite">
            {announcement}
          </p>

          <div
            className={`check__stage${leaving ? ' is-leaving' : ''}`}
            key={stage === 'quiz' ? `q-${current}` : stage}
          >
            {stage === 'intro' && (
              <div className="check__start">
                <p className="check__subtitle">{intro.subtitle}</p>
                <ul className="check__meta" aria-label="In breve">
                  {intro.meta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="button button--primary button--large"
                  onClick={start}
                  data-autofocus
                >
                  {intro.startLabel}
                  <span className="button__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            )}

            {stage === 'quiz' && (
              <>
                <AssessmentProgress
                  current={current}
                  total={total}
                  selections={selections}
                  label={fillTemplate(ui.progressLabel, { current: current + 1, total })}
                  microcopy={questions[current].microcopy}
                />
                <QuestionCard
                  question={questions[current]}
                  selected={selections[current]}
                  picking={picking}
                  onSelect={select}
                  ui={ui}
                  onBack={goBack}
                  onNext={goNext}
                />
              </>
            )}

            {stage === 'result' && (
              <AssessmentResult
                result={result}
                profile={profile}
                questions={questions}
                selections={selections}
                onRestart={restart}
                restartLabel={ui.restartLabel}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
