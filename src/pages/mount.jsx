import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/inter';
import '../styles/index.css';
import { PageContext } from './PageContext.jsx';
import { DEFAULT_LANGUAGE, LANGUAGES, getContent } from '../data/index.js';

/** Where each page lives inside a language folder. */
const PAGES = {
  home: { path: '', root: './' },
  proposte: { path: 'proposte/', root: '../' },
};

/**
 * Shared entry point. The same script serves every language: the HTML page says which one
 * (<html lang>), the Italian pages live at the root, the others in a folder (/en/…).
 */
export function mount(id, render, options = {}) {
  const declared = document.documentElement.lang;
  const lang = LANGUAGES.includes(declared) ? declared : DEFAULT_LANGUAGE;
  const { path, root } = PAGES[id];
  const siteRoot = lang === DEFAULT_LANGUAGE ? root : `${root}../`;
  const page = { id, lang, path, root, siteRoot, ...options };

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <PageContext.Provider value={page}>{render(getContent(lang))}</PageContext.Provider>
    </StrictMode>,
  );
}
