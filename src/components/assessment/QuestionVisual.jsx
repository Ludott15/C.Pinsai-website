import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/* Q1 — repetitive work: bits hop from one support to another, faster and denser as the hours grow. */
function TransferVisual({ level, answers }) {
  const intensity = level === null ? 1 : level + 1;
  const bits = 2 + intensity * 2;

  return (
    <div className="viz viz--transfer" style={{ '--speed': `${(3.4 - intensity * 0.55).toFixed(2)}s` }}>
      <div className="viz__box">
        <span className="viz__box-title">fattura_0427.pdf</span>
        <span className="viz__lines" />
      </div>
      <div className="viz__track">
        {Array.from({ length: bits }, (_, index) => (
          <span key={index} className="viz__bit" style={{ '--i': index, '--n': bits }}>
            {index % 3 === 0 ? '01' : index % 2 ? '1' : '0'}
          </span>
        ))}
        <span className="viz__track-label">copia · incolla · ripeti</span>
      </div>
      <div className="viz__box viz__box--target">
        <span className="viz__box-title">gestionale</span>
        <span className="viz__lines" />
      </div>
      <p className="viz__caption">
        {level === null ? 'Ore a settimana: ?' : `Ore a settimana: ${answers[level].label.toLowerCase()}`}
      </p>
    </div>
  );
}

/* Q2 — response time: an inbox where the waiting time keeps running until an answer is chosen. */
function InboxVisual({ level, answers, selectionMicrocopy }) {
  const reducedMotion = useReducedMotion();
  const [seconds, setSeconds] = useState(0);
  const waiting = level === null;
  const forgotten = level === answers.length - 1;

  useEffect(() => {
    if (!waiting || reducedMotion) return undefined;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [waiting, reducedMotion]);

  const clock = `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className={`viz viz--inbox${forgotten ? ' is-forgotten' : ''}${waiting ? '' : ' is-answered'}`}>
      <div className="inbox__bar">
        <span className="inbox__dot" />
        <span>Nuovo messaggio · 21:47</span>
      </div>
      <div className="inbox__msg inbox__msg--in">
        Buonasera, mi servirebbe un preventivo per giovedì. Riuscite a farmi sapere?
      </div>
      <div className="inbox__status">
        <span className="inbox__timer">{waiting ? clock : answers[level].label}</span>
        <span className="inbox__state">
          {waiting ? 'in attesa di risposta' : forgotten ? 'nessun riscontro' : 'riscontro inviato'}
        </span>
      </div>
      <div className="inbox__msg inbox__msg--out">
        Certo! Ecco il preventivo strutturato.
      </div>
      {level !== null && level > 0 && selectionMicrocopy && <p className="viz__caption">{selectionMicrocopy}</p>}
    </div>
  );
}

const NODES = [
  { id: 'key', x: 120, y: 80, r: 15 },
  { id: 'a', x: 36, y: 34, r: 8 },
  { id: 'b', x: 200, y: 28, r: 8 },
  { id: 'c', x: 214, y: 120, r: 8 },
  { id: 'd', x: 132, y: 150, r: 8 },
  { id: 'e', x: 30, y: 126, r: 8 },
  { id: 'f', x: 78, y: 92, r: 6 },
];

/* Each edge declares from which state it starts to suffer: 1 = slows down, 2 = breaks. */
const EDGES = [
  { from: 'key', to: 'a', slow: 1, broken: 2 },
  { from: 'key', to: 'b', slow: 2, broken: 3 },
  { from: 'key', to: 'c', slow: 1, broken: 2 },
  { from: 'key', to: 'd', slow: 1, broken: 3 },
  { from: 'key', to: 'f', slow: 2, broken: 2 },
  { from: 'a', to: 'f', slow: 3, broken: 3 },
  { from: 'f', to: 'e', slow: 1, broken: 2 },
  { from: 'b', to: 'c', slow: 3, broken: 3 },
  { from: 'd', to: 'e', slow: 2, broken: 2 },
];

const STATE_NAMES = ['attivo', 'rallentato', 'interrotto'];

/* Q3 — key-person dependency: a process network that stays alive, slows down or breaks. */
function NetworkVisual({ level }) {
  const state = level === null ? 0 : level;
  const node = (id) => NODES.find((item) => item.id === id);

  return (
    <div className={`viz viz--network is-state-${state}`}>
      <svg viewBox="0 0 250 176" aria-hidden="true">
        {EDGES.map((edge, index) => {
          const a = node(edge.from);
          const b = node(edge.to);
          const status = state >= edge.broken ? 'broken' : state >= edge.slow ? 'slow' : 'live';
          const d = `M${a.x} ${a.y} L${b.x} ${b.y}`;
          return (
            <g key={`${edge.from}-${edge.to}`} className={`net__edge is-${status}`} style={{ '--i': index }}>
              <path className="net__line" d={d} />
              <path className="net__pulse" d={d} pathLength="100" />
            </g>
          );
        })}
        {NODES.map((item) => (
          <g key={item.id} className={`net__node${item.id === 'key' ? ' net__node--key' : ''}`}>
            <circle cx={item.x} cy={item.y} r={item.r} />
          </g>
        ))}
        <text className="net__key-label" x="120" y="112" textAnchor="middle">
          persona chiave
        </text>
      </svg>
      <p className="viz__caption">Processi: {STATE_NAMES[state]}</p>
    </div>
  );
}

/* Q4 — opportunity: 25% of the repetitive timeline frees itself and becomes yours. */
function ClockVisual({ level, answers }) {
  const reducedMotion = useReducedMotion();
  const [percent, setPercent] = useState(reducedMotion ? 25 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setPercent(25);
      return undefined;
    }
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startedAt) / 1100);
      setPercent(Math.round(25 * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div className="viz viz--clock">
      <div className="clock">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="clock__track" cx="60" cy="60" r="50" />
          <circle className="clock__arc" cx="60" cy="60" r="50" pathLength="100" style={{ '--value': percent }} />
          {Array.from({ length: 12 }, (_, index) => (
            <line key={index} className="clock__tick" x1="60" y1="6" x2="60" y2="12" transform={`rotate(${index * 30} 60 60)`} />
          ))}
        </svg>
        <span className="clock__value">
          {percent}
          <small>%</small>
        </span>
      </div>
      <div className="timeline" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} className={`timeline__slot${index >= 6 ? ' is-free' : ''}`} style={{ '--i': index }} />
        ))}
      </div>
      <p className="viz__caption">
        {level === null ? 'Tempo restituito → ?' : `Tempo restituito → ${answers[level].label}`}
      </p>
    </div>
  );
}

const VISUALS = {
  transfer: TransferVisual,
  inbox: InboxVisual,
  network: NetworkVisual,
  clock: ClockVisual,
};

export default function QuestionVisual({ type, ...props }) {
  const Visual = VISUALS[type];
  return Visual ? (
    <div className="question__visual" aria-hidden="true">
      <Visual {...props} />
    </div>
  ) : null;
}
