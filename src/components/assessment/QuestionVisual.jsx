import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { useUi } from '../../pages/PageContext.jsx';
import { fillTemplate } from '../../utils/text.js';

/* Q1 — repetitive work: bits hop from one support to another, faster and denser as the hours grow. */
function TransferVisual({ level, answers }) {
  const t = useUi().viz;
  const intensity = level === null ? 1 : level + 1;
  const bits = 2 + intensity * 2;

  return (
    <div className="viz viz--transfer" style={{ '--speed': `${(3.4 - intensity * 0.55).toFixed(2)}s` }}>
      <div className="viz__box">
        <span className="viz__box-title">{t.transferFile}</span>
        <span className="viz__lines" />
      </div>
      <div className="viz__track">
        {Array.from({ length: bits }, (_, index) => (
          <span key={index} className="viz__bit" style={{ '--i': index, '--n': bits }}>
            {index % 3 === 0 ? '01' : index % 2 ? '1' : '0'}
          </span>
        ))}
        <span className="viz__track-label">{t.transferTrack}</span>
      </div>
      <div className="viz__box viz__box--target">
        <span className="viz__box-title">{t.transferTarget}</span>
        <span className="viz__lines" />
      </div>
      <p className="viz__caption">
        {fillTemplate(t.transferCaption, { value: level === null ? '?' : answers[level].label.toLowerCase() })}
      </p>
    </div>
  );
}

/* Q2 — response time: an inbox where the waiting time keeps running until an answer is chosen. */
function InboxVisual({ level, answers, selectionMicrocopy }) {
  const t = useUi().viz;
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
        <span>{t.inboxNew}</span>
      </div>
      <div className="inbox__msg inbox__msg--in">
        {t.inboxIn}
      </div>
      <div className="inbox__status">
        <span className="inbox__timer">{waiting ? clock : answers[level].label}</span>
        <span className="inbox__state">
          {waiting ? t.inboxWaiting : forgotten ? t.inboxForgotten : t.inboxAnswered}
        </span>
      </div>
      <div className="inbox__msg inbox__msg--out">
        {t.inboxOut}
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

/* Q3 — key-person dependency: a process network that stays alive, slows down or breaks. */
function NetworkVisual({ level }) {
  const t = useUi().viz;
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
          {t.networkKey}
        </text>
      </svg>
      <p className="viz__caption">{fillTemplate(t.networkCaption, { value: t.networkStates[state] })}</p>
    </div>
  );
}

const HUB = { x: 125, y: 88 };
const CHANNELS = [
  { id: 'crm', x: 125, y: 18 },
  { id: 'phone', x: 38, y: 40 },
  { id: 'email', x: 212, y: 40 },
  { id: 'whatsapp', x: 26, y: 118 },
  { id: 'social', x: 224, y: 118 },
  { id: 'notes', x: 70, y: 160 },
  { id: 'private', x: 180, y: 160 },
];
/* Which channels are in use for each answer, from one CRM to everything, nights included. */
const CHANNELS_BY_LEVEL = [
  ['crm'],
  ['phone', 'email'],
  ['phone', 'email', 'whatsapp', 'social', 'notes'],
  ['phone', 'email', 'whatsapp', 'social', 'notes', 'private'],
];

/* Q4 — channels: requests flow into one inbox, or arrive from everywhere at once. */
function ChannelsVisual({ level }) {
  const t = useUi().viz;
  const active = level === null ? null : CHANNELS_BY_LEVEL[level];
  const state = level === null ? 'idle' : level >= 2 ? 'chaos' : 'calm';

  return (
    <div className={`viz viz--channels is-${state}${level === 3 ? ' is-off-hours' : ''}`}>
      <svg viewBox="0 0 250 178" aria-hidden="true">
        {CHANNELS.map((channel, index) => {
          const on = active?.includes(channel.id);
          /* In the chaos states the lines bend: requests take crooked paths to get in. */
          const bend = state === 'chaos' ? (index % 2 ? 22 : -22) : 0;
          const mx = (channel.x + HUB.x) / 2 + bend;
          const my = (channel.y + HUB.y) / 2 - bend / 2;
          const d = `M${channel.x} ${channel.y} Q${mx} ${my} ${HUB.x} ${HUB.y}`;
          return (
            <g
              key={channel.id}
              className={`chan${on ? ' is-on' : ''}${channel.id === 'private' ? ' chan--private' : ''}`}
              style={{ '--i': index }}
            >
              <path className="chan__line" d={d} />
              {on && <path className="chan__pulse" d={d} pathLength="100" />}
              <circle className="chan__node" cx={channel.x} cy={channel.y} r="7" />
              <text className="chan__label" x={channel.x} y={channel.y + (channel.y > HUB.y ? 17 : -11)} textAnchor="middle">
                {t.channels[channel.id]}
              </text>
            </g>
          );
        })}
        <g className="chan__hub">
          <rect x={HUB.x - 26} y={HUB.y - 15} width="52" height="30" rx="8" />
          <text x={HUB.x} y={HUB.y + 4} textAnchor="middle">
            {t.channelsHub}
          </text>
        </g>
      </svg>
      <p className="viz__caption">{fillTemplate(t.channelsCaption, { value: active ? active.length : '?' })}</p>
    </div>
  );
}

/* Bonus — opportunity: 25% of the repetitive timeline frees itself and becomes yours. */
/** Share of the week given back in the bonus question (25%). */
const RECOVERED = 0.25;

function ClockVisual({ level, answers, question }) {
  const t = useUi().viz;
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
      {/* One week, 7 days: the last 25% of it (1.75 days) is the time given back. */}
      <div className="week">
        <div className="week__head">
          <span className="week__label">{question.week.label}</span>
          <span className="week__recovered">{question.week.recovered}</span>
        </div>
        <div className="week__blocks">
          {question.week.days.map((day, index, days) => {
            const free = Math.min(1, Math.max(0, index + 1 - days.length * (1 - RECOVERED)));
            return (
              <span key={index} className="week__block" style={{ '--i': index, '--free': free }}>
                {free > 0 && <span className="week__free" />}
                <span className="week__day">{day}</span>
              </span>
            );
          })}
        </div>
      </div>
      <p className="viz__caption">
        {fillTemplate(t.clockCaption, { value: level === null ? '?' : answers[level].label })}
      </p>
    </div>
  );
}

/* Bonus — an extra coffee, offered by the house. */
function BonusVisual({ question }) {
  return (
    <div className="viz viz--bonus">
      <span className="bonus__mark">+1</span>
      <p className="viz__caption">{question.note}</p>
    </div>
  );
}

const VISUALS = {
  transfer: TransferVisual,
  inbox: InboxVisual,
  network: NetworkVisual,
  channels: ChannelsVisual,
  clock: ClockVisual,
  bonus: BonusVisual,
};

export default function QuestionVisual({ type, ...props }) {
  const Visual = VISUALS[type];
  return Visual ? (
    <div className="question__visual" aria-hidden="true">
      <Visual {...props} />
    </div>
  ) : null;
}
