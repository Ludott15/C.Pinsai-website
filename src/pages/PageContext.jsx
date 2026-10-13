import { createContext, useContext } from 'react';

/**
 * Which page is rendering and where the site root is, relative to it.
 * Links are kept relative so the build works from any folder (Vercel, previews, subdirectories).
 */
export const PageContext = createContext({ id: 'home', root: './' });

/**
 * Turns a site link into one that works from the current page. Anchors point to the home page,
 * unless the current page has that section too (`anchors`, e.g. the contacts on every page).
 */
export function resolveHref(href, page) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  if (href.startsWith('#')) {
    return page.id === 'home' || page.anchors?.includes(href) ? href : `${page.root}${href}`;
  }
  return `${page.root}${href}`;
}

export function usePage() {
  return useContext(PageContext);
}

export function useHref() {
  const page = usePage();
  return (href) => resolveHref(href, page);
}
