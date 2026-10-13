import { LANGUAGES } from '../data/index.js';
import { languageHref, usePage, useUi } from '../pages/PageContext.jsx';

/** IT | EN: the same page in the other language, keeping the section you are on (#hash). */
export default function LanguageSwitch({ className = '' }) {
  const page = usePage();
  const ui = useUi();

  return (
    <nav className={`lang ${className}`.trim()} aria-label={ui.language}>
      <ul>
        {LANGUAGES.map((lang) => {
          const current = lang === page.lang;
          return (
            <li key={lang}>
              <a
                href={languageHref(page, lang)}
                hrefLang={lang}
                lang={lang}
                className="lang__link"
                aria-current={current ? 'true' : undefined}
                aria-label={ui.languageNames[lang]}
                onClick={(event) => {
                  if (current) return;
                  event.currentTarget.href = languageHref(page, lang) + window.location.hash;
                }}
              >
                {lang.toUpperCase()}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
