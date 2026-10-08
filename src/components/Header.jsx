import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';

const DESKTOP_QUERY = '(min-width: 960px)';

function useActiveSection(hrefs) {
  const [active, setActive] = useState(hrefs[0]);

  useEffect(() => {
    const sections = hrefs.map((href) => document.querySelector(href)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [hrefs]);

  return active;
}

function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > offset);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [offset]);

  return scrolled;
}

export default function Header({ brand, navigation, cta }) {
  const [open, setOpen] = useState(false);
  const [hrefs] = useState(() => navigation.map((item) => item.href));
  const active = useActiveSection(hrefs);
  const scrolled = useScrolled();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    panelRef.current?.querySelector('a')?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const media = window.matchMedia(DESKTOP_QUERY);
    const onMedia = () => media.matches && setOpen(false);

    document.addEventListener('keydown', onKey);
    media.addEventListener('change', onMedia);
    return () => {
      document.removeEventListener('keydown', onKey);
      media.removeEventListener('change', onMedia);
    };
  }, [open]);

  const links = navigation.map((item) => (
    <li key={item.href}>
      <a
        href={item.href}
        className="nav__link"
        aria-current={active === item.href ? 'true' : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </a>
    </li>
  ));

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="header__bar">
        <a href="#home" className="header__brand" aria-label={`${brand.name} — torna all'inizio`}>
          <Logo name={brand.name} />
        </a>

        <nav className="nav nav--desktop" aria-label="Principale">
          <ul>{links}</ul>
        </nav>

        <a href={cta.href} className="header__cta">
          {cta.label}
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="visually-hidden">{open ? 'Chiudi il menu' : 'Apri il menu'}</span>
          <span className="header__toggle-icon" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="mobile-nav"
        ref={panelRef}
        className="nav nav--mobile"
        aria-label="Principale (mobile)"
        hidden={!open}
      >
        <ul>{links}</ul>
      </nav>
    </header>
  );
}
