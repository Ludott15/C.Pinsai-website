import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Multi-page site: every page is a static HTML file with its own React entry. */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    /* three.js lives in its own lazily loaded chunk (the 3D cup): it never blocks the first paint. */
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        soluzioni: resolve(import.meta.dirname, 'soluzioni/index.html'),
        proposte: resolve(import.meta.dirname, 'proposte/index.html'),
        homeEn: resolve(import.meta.dirname, 'en/index.html'),
        proposteEn: resolve(import.meta.dirname, 'en/proposte/index.html'),
      },
    },
  },
});
