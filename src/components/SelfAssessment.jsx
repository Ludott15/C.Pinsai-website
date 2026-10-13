import { useCallback, useEffect, useRef, useState } from 'react';
import QuestionCard from './assessment/QuestionCard.jsx';
import AssessmentProgress from './assessment/AssessmentProgress.jsx';
import AssessmentResult from './assessment/AssessmentResult.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useInView } from '../hooks/useInView.js';
import { computeScore, findProfile } from '../utils/assessment.js';
import { fillTemplate } from '../utils/text.js';

/** Time the selected answer stays on screen (check mark + pulse) before moving on. */
const PICK_DELAY = 650;
/** Must match the duration of the `.check__stage.is-leaving` animation in assessment.css. */
const LEAVE_DURATION = 600;
const LEAVE_DURATION_MOBILE = 420;

const leaveDuration = (reducedMotion) => {
  if (reducedMotion) return 0;
  return window.matchMedia('(max-width: 640px)').matches ? LEAVE_DURATION_MOBILE : LEAVE_DURATION;
};

export default function SelfAssessment({ data }) {
  const { intro, ui, questions, bonus, result } = data;
  /* The announced questions ("Domanda X di 4") and, after them, the unannounced bonus one. */
  const total = questions.length;
  const steps = bonus ? [...questions, bonus] : questions;

  const [stage, setStage] = useState('intro');
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState(() => Array(steps.length).fill(null));
  const [leaving, setLeaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const reducedMotion = useReducedMotion();
  const [introRef, introInView] = useInView({ threshold: 0.2 });
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

  const stepLabel = (index) =>
    index < total ? fillTemplate(ui.progressLabel, { current: index + 1, total }) : ui.bonusLabel;

  const showQuestion = (index) => {
    setStage('quiz');
    setCurrent(index);
    setAnnouncement(`${stepLabel(index)}. ${steps[index].microcopy}`);
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
      if (current + 1 < steps.length) showQuestion(current + 1);
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
      setSelections(Array(steps.length).fill(null));
      showQuestion(0);
    });
  };

  const score = computeScore(questions, selections);
  const profile = findProfile(result.profiles, score);

  return (
    <section id="coffee-check" className="check" aria-labelledby="check-title">
      <div className="check__inner shell">
        <header ref={introRef} className={`check__intro${introInView ? ' is-visible' : ''}`}>
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
                  segments={current < total ? total : steps.length}
                  selections={selections}
                  label={stepLabel(current)}
                  microcopy={steps[current].microcopy}
                  bonus={current >= total}
                />
                <QuestionCard
                  question={steps[current]}
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
                questions={steps}
                selections={selections}
                onRestart={restart}
                restartLabel={ui.restartLabel}
              />
            )}
          </div>
        </div>
      </div>

      <div className="check__waves" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 120 L0 64 C 160 20, 320 96, 520 60 C 720 24, 860 92, 1060 58 C 1220 30, 1340 70, 1440 44 L1440 120 Z" />
        </svg>
      </div>
    </section>
  );
}
