import { useEffect } from 'react';
import site from '../data/site.json';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function PageShell({ children }) {
  /* The page is rendered by script, after the browser looked for the #anchor: scroll to it now. */
  useEffect(() => {
    const target = window.location.hash.length > 1 && document.getElementById(window.location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <Header brand={site.brand} navigation={site.navigation} cta={site.navCta} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer
        brand={site.brand}
        content={site.footer}
        navigation={site.navigation}
        contact={site.contact}
        legal={site.legal}
      />
    </>
  );
}
