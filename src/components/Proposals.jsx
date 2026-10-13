import { useEffect, useRef, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import ModuleSection from './proposals/ModuleSection.jsx';
import ProductShowcase from './proposals/ProductShowcase.jsx';
import WipPanel from './proposals/WipPanel.jsx';
import { useHref } from '../pages/PageContext.jsx';
import SectionWave from './SectionWave.jsx';

const sectionFromHash = (sections) => {
  const id = window.location.hash.slice(1);
  return sections.some((section) => section.id === id) ? id : sections[0].id;
};

/**
 * "Le nostre demo": a pill for every sector; choosing one opens its section
 * (tabs, with the choice kept in the address so it can be linked and survives "back").
 */
export default function Proposals({ intro, data, phone }) {
  const { sections, request, demo } = data;
  const [active, setActive] = useState(() => sectionFromHash(sections));
  const pillsRef = useRef(null);
  const panelRef = useRef(null);
  const toHref = useHref();

  useEffect(() => {
    const onHash = () => setActive(sectionFromHash(sections));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [sections]);

  /* Keep the active pill visible inside the horizontal list, without moving the page. */
  useEffect(() => {
    const list = pillsRef.current;
    const pill = list?.querySelector(`[data-id="${active}"]`);
    if (!list || !pill) return;
    list.scrollTo({ left: pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  const open = (id) => {
    if (id === active) return;
    window.history.replaceState(null, '', `#${id}`);
    setActive(id);
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ block: 'start' });
    }
  };

  /* Arrow keys move between tabs, as in any tab list. */
  const onKeyDown = (event) => {
    const index = sections.findIndex((section) => section.id === active);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = sections[(index + step + sections.length) % sections.length].id;
    open(next);
    pillsRef.current?.querySelector(`[data-id="${next}"]`)?.focus();
  };

  const section = sections.find((item) => item.id === active);

  return (
    <section className="proposals" aria-labelledby="proposals-title">
      <div className="shell">
        <SectionHeader id="proposals-title" as="h1" {...intro} />
      </div>

      <div className="pills">
        <div ref={pillsRef} className="pills__list shell" role="tablist" aria-label={intro.navLabel} onKeyDown={onKeyDown}>
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              data-id={item.id}
              className="pills__pill"
              aria-selected={item.id === active}
              aria-controls="sector-panel"
              tabIndex={item.id === active ? 0 : -1}
              onClick={() => open(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={panelRef}
        id="sector-panel"
        className="sector shell"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        key={active}
      >
        {section.type === 'product' && <ProductShowcase section={section} phone={phone} />}
        {section.type === 'modules' && (
          <ModuleSection section={section} request={request} demo={demo} phone={phone} />
        )}
        {section.type === 'wip' && <WipPanel section={section} phone={phone} />}
      </div>

      <div className="proposals__back shell">
        <a className="button button--primary button--large" href={toHref(intro.back.href)}>
          <span className="button__arrow" aria-hidden="true">
            ←
          </span>
          {intro.back.label}
        </a>
      </div>
      <SectionWave to="brown-900" />
    </section>
  );
}
