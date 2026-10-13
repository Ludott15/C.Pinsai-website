import { useEffect, useRef } from 'react';
import { useUi } from '../pages/PageContext.jsx';

/** Native modal dialog: focus trapping, Escape and the backdrop are handled by the browser. */
export default function LegalDialog({ entry, onClose }) {
  const ui = useUi();
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (entry && !dialog.open) dialog.showModal();
    if (!entry && dialog.open) dialog.close();
  }, [entry]);

  const onClick = (event) => {
    if (event.target === ref.current) onClose();
  };

  return (
    <dialog ref={ref} className="legal" aria-labelledby="legal-title" onClose={onClose} onClick={onClick}>
      {entry && (
        <div className="legal__inner">
          <h2 id="legal-title" className="legal__title">
            {entry.title}
          </h2>
          {entry.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <button type="button" className="button button--primary" onClick={onClose} autoFocus>
            {ui.close}
          </button>
        </div>
      )}
    </dialog>
  );
}
