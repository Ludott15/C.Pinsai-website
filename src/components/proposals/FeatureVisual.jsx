import { useUi } from '../../pages/PageContext.jsx';

/*
 * Small moving interfaces that show each feature at work. They are illustrations:
 * no real data, decorative for assistive technologies (the text beside them says it all).
 */

function Messages() {
  const t = useUi().fv;
  return (
    <div className="fv fv--messages">
      <p className="fv__bubble fv__bubble--in">{t.messagesIn}</p>
      <div className="fv__suggest">
        <span className="fv__label">{t.messagesSuggestion}</span>
        <span className="fv__slot">
          <span className="fv__typing">
            <i />
            <i />
            <i />
          </span>
          <span className="fv__suggest-text">{t.messagesReply}</span>
        </span>
        <span className="fv__actions">
          <b className="fv__approve">{t.approve}</b>
          <b>{t.edit}</b>
        </span>
      </div>
      <p className="fv__bubble fv__bubble--out">{t.messagesReply}</p>
    </div>
  );
}

function Reminders() {
  const rows = useUi().fv.reminders;
  return (
    <ol className="fv fv--reminders">
      {rows.map(([when, what], index) => (
        <li key={what} style={{ '--i': index }}>
          <span className="fv__bell" />
          <span className="fv__when">{when}</span>
          <span className="fv__what">{what}</span>
        </li>
      ))}
    </ol>
  );
}

function Accounting() {
  const t = useUi().fv;
  return (
    <div className="fv fv--accounting">
      <div className="fv__bars">
        {[46, 64, 38, 72, 58, 84, 66].map((height, index) => (
          <span key={index} style={{ '--h': `${height}%`, '--i': index }} />
        ))}
      </div>
      <p className="fv__alert">
        <span className="fv__bell" />
        {t.accountingAlert}
      </p>
    </div>
  );
}

function Crm() {
  const rows = useUi().fv.crm;
  return (
    <ul className="fv fv--crm">
      {rows.map(([initials, note, tag], index) => (
        <li key={initials} style={{ '--i': index }}>
          <span className="fv__avatar">{initials}</span>
          <span className="fv__line" />
          <span className="fv__note">{note}</span>
          <span className="fv__tag">{tag}</span>
        </li>
      ))}
    </ul>
  );
}

function Reports() {
  const t = useUi().fv;
  return (
    <div className="fv fv--reports">
      <svg viewBox="0 0 240 90" preserveAspectRatio="none">
        <path className="fv__area" d="M0 78 L30 70 L60 74 L90 56 L120 60 L150 40 L180 44 L210 26 L240 18 L240 90 L0 90 Z" />
        <path className="fv__trend" d="M0 78 L30 70 L60 74 L90 56 L120 60 L150 40 L180 44 L210 26 L240 18" pathLength="100" />
      </svg>
      <div className="fv__comment">
        <span className="fv__label">{t.reportsComment}</span>
        <span className="fv__skeleton" />
        <span className="fv__skeleton fv__skeleton--short" />
      </div>
    </div>
  );
}

function Dashboard({ feature }) {
  return (
    <div className={`fv fv--dashboard is-${feature.id}`}>
      <div className="fv__dash-head">
        <span>{feature.title}</span>
        <i />
      </div>
      <div className="fv__dash-body">
        {feature.items.map((item, index) => (
          <span key={item} className="fv__tile" style={{ '--i': index }}>
            <i />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const VISUALS = {
  messages: Messages,
  reminders: Reminders,
  accounting: Accounting,
  crm: Crm,
  reports: Reports,
  dashboard: Dashboard,
};

export default function FeatureVisual({ feature }) {
  const Visual = VISUALS[feature.visual];
  return Visual ? (
    <div className="feature__visual" aria-hidden="true">
      <Visual feature={feature} />
    </div>
  ) : null;
}
