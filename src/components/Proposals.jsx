import { useEffect, useRef, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import ProposalCard from './proposals/ProposalCard.jsx';
import { useHref } from '../pages/PageContext.jsx';

/** Follows which category is in view, to highlight its pill. */
function useActiveCategory(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function Proposals({ intro, categories }) {
  const [ids] = useState(() => categories.map((category) => category.id));
  const active = useActiveCategory(ids);
  const pillsRef = useRef(null);
  const toHref = useHref();

  /* Keep the active pill visible inside the horizontal list, without moving the page. */
  useEffect(() => {
    const list = pillsRef.current;
    const pill = list?.querySelector(`[data-id="${active}"]`);
    if (!list || !pill) return;
    const left = pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2;
    list.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  return (
    <section className="proposals" aria-labelledby="proposals-title">
      <div className="shell">
        <SectionHeader id="proposals-title" as="h1" {...intro} />
      </div>

      <nav className="pills" aria-label={intro.navLabel}>
        <ul ref={pillsRef} className="pills__list shell">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`#${category.id}`}
                data-id={category.id}
                className="pills__pill"
                aria-current={active === category.id ? 'true' : undefined}
              >
                {category.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="proposals__groups shell">
        {categories.map((category) => (
          <section key={category.id} id={category.id} className="proposals__group" aria-labelledby={`${category.id}-group`}>
            <h2 id={`${category.id}-group`} className="proposals__group-title">
              {category.label}
            </h2>
            <div className="proposals__cards">
              {category.cards.map((card) => (
                <ProposalCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="proposals__back shell">
        <a className="button button--primary button--large" href={toHref(intro.back.href)}>
          <span className="button__arrow" aria-hidden="true">
            ←
          </span>
          {intro.back.label}
        </a>
      </div>
    </section>
  );
}
