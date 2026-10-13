import { createContext, useContext } from 'react';
import { getContent } from '../data/index.js';

/**
 * Which page is rendering, in which language, and where things are relative to it.
 * - root: the home of the current language (links between pages stay inside the language);
 * - siteRoot: the real root of the site (the Italian home), used to switch language.
 * Links are kept relative so the build works from any folder (Vercel, previews, subdirectories).
 */
export const PageContext = createContext({ id: 'home', lang: 'it', root: './', siteRoot: './', path: '' });

/** Turns a site link into one that works from the current page. */
export function resolveHref(href, page) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  /* Anchors point to the home page, unless this page has that section too (`anchors`). */
  if (href.startsWith('#')) {
    return page.id === 'home' || page.anchors?.includes(href) ? href : `${page.root}${href}`;
  }
  return `${page.root}${href}`;
}

/** The same page in another language (the hash, if any, is added at click time). */
export function languageHref(page, lang) {
  return `${page.siteRoot}${lang === 'it' ? '' : `${lang}/`}${page.path}`;
}

export function usePage() {
  return useContext(PageContext);
}

export function useHref() {
  const page = usePage();
  return (href) => resolveHref(href, page);
}

/** The copy of the current language: { site, assessment, services, proposals, metrics, ui }. */
export function useContent() {
  return getContent(usePage().lang);
}

export function useUi() {
  return useContent().ui;
}
