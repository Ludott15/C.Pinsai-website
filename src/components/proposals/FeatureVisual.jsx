/*
 * Small moving interfaces that show each feature at work. They are illustrations:
 * no real data, decorative for assistive technologies (the text beside them says it all).
 */

function Messages() {
  return (
    <div className="fv fv--messages">
      <p className="fv__bubble fv__bubble--in">Buongiorno, posso spostare l'appuntamento a giovedì?</p>
      <div className="fv__suggest">
        <span className="fv__label">Suggerimento di SegretarIA</span>
        <span className="fv__slot">
          <span className="fv__typing">
            <i />
            <i />
            <i />
          </span>
          <span className="fv__suggest-text">Certo! Giovedì alle 10:00 le va bene?</span>
        </span>
        <span className="fv__actions">
          <b className="fv__approve">Approva</b>
          <b>Modifica</b>
        </span>
      </div>
      <p className="fv__bubble fv__bubble--out">Certo! Giovedì alle 10:00 le va bene?</p>
    </div>
  );
}

function Reminders() {
  const rows = [
    ['1 giorno prima', 'Conferma appuntamento'],
    ['Ogni tot mesi, decidi tu', 'Richiamo cliente'],
    ['In scadenza', 'Rinnovo da ricordare'],
  ];
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
  return (
    <div className="fv fv--accounting">
      <div className="fv__bars">
        {[46, 64, 38, 72, 58, 84, 66].map((height, index) => (
          <span key={index} style={{ '--h': `${height}%`, '--i': index }} />
        ))}
      </div>
      <p className="fv__alert">
        <span className="fv__bell" />
        Promemoria insoluto inviato
      </p>
    </div>
  );
}

function Crm() {
  const rows = [
    ['MR', 'Cliente dal 2021', 'Fedele'],
    ['GB', 'Ultimo contatto: ieri', 'Da richiamare'],
    ['LS', 'Nuovo cliente', 'Primo appuntamento'],
    ['AP', 'Ultimo contatto: 3 mesi fa', 'Richiamo'],
  ];
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
  return (
    <div className="fv fv--reports">
      <svg viewBox="0 0 240 90" preserveAspectRatio="none">
        <path className="fv__area" d="M0 78 L30 70 L60 74 L90 56 L120 60 L150 40 L180 44 L210 26 L240 18 L240 90 L0 90 Z" />
        <path className="fv__trend" d="M0 78 L30 70 L60 74 L90 56 L120 60 L150 40 L180 44 L210 26 L240 18" pathLength="100" />
      </svg>
      <div className="fv__comment">
        <span className="fv__label">Il commento di SegretarIA</span>
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
