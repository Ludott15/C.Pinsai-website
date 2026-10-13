import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { useHref, usePage } from '../pages/PageContext.jsx';

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
  const page = usePage();
  const toHref = useHref();
  const [hrefs] = useState(() => navigation.map((item) => item.href));
  const activeSection = useActiveSection(hrefs, page.id === 'home');
  const [submenu, setSubmenu] = useState(false);
  const isCurrent = (item) => (page.id === 'home' ? activeSection === item.href : item.page === page.id);
  const hasCurrentChild = (item) => (item.children ?? []).some(isCurrent);
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

  /* Desktop dropdown: closes on Escape and on a click outside it. */
  useEffect(() => {
    if (!submenu) return undefined;
    const onKey = (event) => event.key === 'Escape' && setSubmenu(false);
    const onClick = (event) => !event.target.closest('.nav__group') && setSubmenu(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [submenu]);

  const link = (item, className = 'nav__link') => (
    <a
      href={toHref(item.href)}
      className={`${className}${hasCurrentChild(item) ? ' has-current' : ''}`}
      aria-current={isCurrent(item) ? (item.page ? 'page' : 'true') : undefined}
      onClick={() => {
        setOpen(false);
        setSubmenu(false);
      }}
    >
      {item.label}
    </a>
  );

  const links = (variant) =>
    navigation.map((item) => {
      if (!item.children) return <li key={item.href}>{link(item)}</li>;
      const submenuId = `submenu-${variant}-${item.page}`;
      return (
        <li key={item.href} className="nav__group" data-open={variant === 'desktop' && submenu ? '' : undefined}>
          {link(item)}
          {variant === 'desktop' && (
            <button
              type="button"
              className="nav__caret"
              aria-expanded={submenu}
              aria-controls={submenuId}
              onClick={() => setSubmenu((value) => !value)}
            >
              <span className="visually-hidden">{item.submenuLabel}</span>
            </button>
          )}
          <ul id={submenuId} className="nav__submenu">
            {item.children.map((child) => (
              <li key={child.href}>{link(child, 'nav__sublink')}</li>
            ))}
          </ul>
        </li>
      );
    });

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="header__bar">
        <a href={toHref('#home')} className="header__brand" aria-label={`${brand.name} — torna all'inizio`}>
          <Logo name={brand.name} />
        </a>

        <nav className="nav nav--desktop" aria-label="Principale">
          <ul>{links('desktop')}</ul>
        </nav>

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
        <ul>{links('mobile')}</ul>
      </nav>
    </header>
  );
}
