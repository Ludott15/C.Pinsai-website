import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';
import { useHref, usePage, useUi } from '../pages/PageContext.jsx';
import { fillTemplate } from '../utils/text.js';

const DESKTOP_QUERY = '(min-width: 960px)';

/** On the landing page, follows the section in view. */
function useActiveSection(hrefs, enabled) {
  const [active, setActive] = useState(hrefs[0]);

  useEffect(() => {
    if (!enabled) return undefined;
    const sections = hrefs
      .filter((href) => href.startsWith('#'))
      .map((href) => document.querySelector(href))
      .filter(Boolean);
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
  }, [hrefs, enabled]);

  return active;
}

/**
 * Scroll state of the page: `scrolled` past the top, and `hidden` while scrolling down.
 * The smallest scroll up brings the bar back.
 */
function useScrollState(offset = 24) {
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setState((current) => {
        const hidden = y < 120 ? false : delta > 2 ? true : delta < -1 ? false : current.hidden;
        const scrolled = y > offset;
        return hidden === current.hidden && scrolled === current.scrolled ? current : { scrolled, hidden };
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [offset]);

  return state;
}

export default function Header({ brand, navigation, cta }) {
  const [open, setOpen] = useState(false);
  const page = usePage();
  const ui = useUi();
  const toHref = useHref();
  const [hrefs] = useState(() => navigation.map((item) => item.href));
  const activeSection = useActiveSection(hrefs, page.id === 'home');
  const isCurrent = (item) => (page.id === 'home' ? activeSection === item.href : item.page === page.id);
  const { scrolled, hidden } = useScrollState();
  /* Keyboard users always keep the bar: it never hides while it holds the focus. */
  const [focusInside, setFocusInside] = useState(false);
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
        href={toHref(item.href)}
        className="nav__link"
        aria-current={isCurrent(item) ? (item.page ? 'page' : 'true') : undefined}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </a>
    </li>
  ));

  return (
    <header
      className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}${
        hidden && !open && !focusInside ? ' is-hidden' : ''
      }`}
      onFocus={() => setFocusInside(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocusInside(false)}
    >
      <div className="header__bar">
        <a href={toHref('#home')} className="header__brand" aria-label={fillTemplate(ui.brandHome, { brand: brand.name })}>
          <Logo name={brand.name} />
        </a>

        <nav className="nav nav--desktop" aria-label={ui.navMain}>
          <ul>{links}</ul>
        </nav>

        <LanguageSwitch className="lang--header" />

        <a href={toHref(cta.href)} className="header__cta">
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
          <span className="visually-hidden">{open ? ui.menuClose : ui.menuOpen}</span>
          <span className="header__toggle-icon" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="mobile-nav"
        ref={panelRef}
        className="nav nav--mobile"
        aria-label={ui.navMobile}
        hidden={!open}
      >
        <ul>{links}</ul>
        <LanguageSwitch className="lang--mobile" />
      </nav>
    </header>
  );
}
