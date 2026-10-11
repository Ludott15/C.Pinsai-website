import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/jetbrains-mono';
import '../styles/index.css';
import { PageContext } from './PageContext.jsx';

/** Shared entry point: every HTML page mounts its own React tree with the page context. */
export function mount(page, element) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <PageContext.Provider value={page}>{element}</PageContext.Provider>
    </StrictMode>,
  );
}
