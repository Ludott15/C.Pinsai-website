# C.PINSAI — sito web

Landing page narrativa di C.PINSAI: *caffè + codice + AI + automazione + persone*.
React 19 + Vite, CSS moderno senza framework, contenuti in JSON.

## Avvio

```bash
npm install
npm run dev       # sviluppo su http://localhost:5173
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
```

Requisiti: Node.js 20+.

## Struttura

Sito multi-pagina statico (Vite, nessun router): ogni pagina è un file HTML con il suo ingresso React.

```
index.html                  Landing: Hero → Dive → Self-Assessment → Numeri → CTA → Contatti
soluzioni/index.html        Soluzioni: Tailored Service, Facilit-AI, "Le nostre proposte"
proposte/index.html         Proposte: infrastrutture per settore (pill di navigazione + card premium)
public/favicon.svg
src/
  pages/                    ingressi delle pagine (home, soluzioni, proposte), PageShell, PageContext
                            (i link sono relativi, risolti da useHref: funzionano da qualsiasi cartella)
  data/                     tutti i contenuti, modificabili senza toccare React
    site.json               brand, navigazione, hero, dive, intro delle sezioni, contatti, footer, note legali
    assessment.json         Coffee Check: 4 domande con punteggio, domanda bonus, profili e frasi
    services.json           soluzioni (Tailored Service, Facilit-AI)
    proposals.json          proposte per categoria (Segretaria, Ristorazione, Palestre): aggiungere una
                            categoria qui aggiunge anche la sua pill
    metrics.json            i quattro numeri e i rispettivi "perché"
  three/CupScene.js         la tazzina 3D (three.js), caricata in differita
  hooks/                    scroll (con smoothing), reveal, reduced motion
  utils/                    timeline del dive, manico SVG, punteggio, testo
  components/               componenti della UI
  styles/                   base (token), header, hero, assessment, services, sections, proposals
```

## Come funziona

**Tazzina 3D.** `src/three/CupScene.js` costruisce la tazza in codice (corpo e piattino al tornio,
manico come tubo, logo come decalcomania, contorno marrone) con le stesse unità del disegno SVG, così
vapore e cerchio del dive restano allineati. three.js viene scaricato solo dopo il primo rendering;
la tazzina SVG resta come fallback (niente WebGL, prefers-reduced-motion, risparmio dati) e su mobile
la risoluzione è limitata. Il rendering si ferma quando la hero non è visibile.

**Hero e "Dive into coffee".** La sezione hero è una track alta 250svh con uno stage sticky.
`useScrollProgress` misura il progresso (un solo `getBoundingClientRect` per frame, via rAF) e
`utils/dive.js` lo trasforma in variabili CSS (`--turn`, `--tilt`, `--zoom`, `--fill`, …).
Tutte le animazioni usano solo `transform`, `opacity` e una maschera: React non re-renderizza mai durante lo scroll.
La tazzina è fatta di livelli indipendenti (SVG + CSS 3D): il manico orbita sull'asse Y, il logo stampato
scorre sul corpo, la bocca si apre con l'inclinazione, poi la camera entra nel caffè e un cerchio marrone
(con bordo morbido) diventa l'ambiente del Coffee Check.

**Vapore binario.** `CoffeeSteam` genera i frammenti (0/1 e pochi glifi di codice) con un random
deterministico: ogni frammento ha durata, ritardo, deriva laterale, rotazione, scala e opacità propri;
i tre "filamenti" oscillano con ritmi diversi. Colore: esattamente `#E04A95`.

**Coffee Check.** Le domande sono in `assessment.json` (testo, risposte, punteggi, visual).
Il risultato è la somma dei punteggi, mappata sui range dei `profiles`. Per aggiungere o modificare domande
basta il JSON; il campo `visual` sceglie uno dei visual esistenti (`transfer`, `inbox`, `network`, `clock`).

**Contatti.** Il sito è statico: il form valida i campi lato client e compone un messaggio WhatsApp
precompilato verso il numero in `site.json` (`contact.phoneE164`). Se il browser blocca la nuova scheda,
viene mostrato un link manuale.

## Accessibilità

- Pulsanti reali per tutte le azioni, link reali per la navigazione; skip link; gerarchia h1 → h2 → h3.
- Coffee Check: `aria-pressed` sulle risposte, `aria-current="step"` sul progresso, regione `aria-live`,
  focus spostato sulla nuova domanda/risultato a ogni passaggio.
- Form: label reali, `aria-invalid`, `aria-describedby` per suggerimenti ed errori, focus sul primo campo errato.
- `prefers-reduced-motion`: niente track sticky né zoom, vapore immobile, nessun parallax; la transizione
  crema → caffè resta come gradiente statico.
- Il rosa `#E04A95` è usato per testo solo in grandi dimensioni o su sfondo con contrasto adeguato;
  per il testo piccolo su marrone si usa la sola variante chiara `#F59AC6`.

## Palette

`#F5EFE2` crema (+ `#FBF8F1` più chiaro), `#E04A95` rosa (+ `#F59AC6` più chiaro),
`#4B2D20` marrone (+ `#3A2218`, `#2A1810`, `#1C100B` più scuri), `#FFFFFF`.

## Dipendenze

Solo `react`, `react-dom`, `three` (caricato in differita per la tazzina 3D) e i font variabili `@fontsource-variable/bricolage-grotesque` e
`@fontsource-variable/jetbrains-mono`, serviti dal sito stesso (nessuna richiesta a Google Fonts).
In sviluppo: `vite` e `@vitejs/plugin-react`.

## Note

I testi di Privacy e Cookie (`site.json → legal`) descrivono il comportamento reale del sito
(nessun cookie, nessun tracciamento, form senza backend): vanno fatti validare da un consulente
prima della pubblicazione.
