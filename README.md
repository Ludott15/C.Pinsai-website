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
index.html                  Landing: Hero → Dive → Self-Assessment → Soluzioni → Numeri → Contatti
soluzioni/index.html        redirect ai vecchi link: le Soluzioni ora sono nella home (#soluzioni)
proposte/index.html         Le nostre demo: un settore alla volta (SegretarIA, Ristorazione, Palestre, Officine) + Contatti
public/favicon.svg
src/
  pages/                    ingressi delle pagine (home, proposte), PageShell, PageContext
                            (i link sono relativi, risolti da useHref: funzionano da qualsiasi cartella)
  data/                     tutti i contenuti, modificabili senza toccare React
    site.json               brand, navigazione, hero, dive, intro delle sezioni, contatti, footer, note legali
    assessment.json         Coffee Check: 4 domande con punteggio, domanda bonus, profili e frasi
    services.json           soluzioni (Tailored Service, Facilit-AI)
    proposals.json          settori della pagina demo: "product" (presentazione a scorrimento, es.
                            SegretarIA), "modules" (moduli selezionabili e richiedibili su WhatsApp,
                            con demo incorporabile: campo `demo` = { type: "iframe" | "video", src })
                            o "wip" (lavori in corso). Aggiungere un settore qui aggiunge la sua pill
    metrics.json            i quattro numeri e i rispettivi "perché"
  three/CupScene.js         la tazzina 3D (three.js), caricata in differita
  assets/                   modello 3D della tazzina e la sua immagine di riserva
  hooks/                    scroll (con smoothing), reveal, reduced motion
  utils/                    timeline del dive, punteggio, testo
  components/               componenti della UI
  styles/                   base (token), header, hero, assessment, services, sections, proposals
```

## Come funziona

**Tazzina 3D.** Il modello è `src/assets/cpinsai-cup.glb` (tazzina in ceramica avorio, bordi blu, caffè scuro).
`src/three/CupScene.js` lo carica con three.js, ricostruisce le normali, converte i colori del modello (salvati in sRGB)
e li applica a materiali ceramici lucidi; lo porta nelle unità del riquadro della hero (caffè a y = 0,
così il cerchio del dive si apre dal caffè) e segue lo scroll: rotazione, inclinazione della camera, avvicinamento.
Poiché l'avorio è quasi uguale allo sfondo crema, il contrasto viene dalla luce: una key light morbida con ombre reali,
due controluce e un ambiente "studio" che disegnano i bordi lucidi, più un'ombra di contatto sul tavolo.
Durante l'avvicinamento il caffè sfuma nello stesso marrone del dive (`--brown-800`), senza stacchi.
Sopra il caffè c'è il vapore rosa in pixel con i bit 0/1 (`src/three/Steam.js`), che sfuma all'inizio del dive. three.js e il modello vengono scaricati solo dopo il primo rendering;
`src/assets/cpinsai-cup.webp` è un'immagine ricavata dallo stesso modello, mostrata mentre carica e come
fallback (niente WebGL, prefers-reduced-motion, risparmio dati). Se il modello cambia, va rigenerata anche
l'immagine (stessa inquadratura: riquadro 400 × 400, caffè al 31,25% dell'altezza).

**Hero e "Dive into coffee".** La sezione hero è una track alta 250svh con uno stage sticky.
`useScrollProgress` misura il progresso (un solo `getBoundingClientRect` per frame, via rAF) e
`utils/dive.js` lo trasforma in variabili CSS (`--turn`, `--tilt`, `--zoom`, `--fill`, …).
Tutte le animazioni usano solo `transform`, `opacity` e una maschera: React non re-renderizza mai durante lo scroll.
La camera entra nel caffè e uno splash marrone (`src/assets/dive-splash.svg`, usato come maschera: bordo ondulato, dita e gocce)
copre lo schermo e lascia il posto all'onda del Coffee Check.

**Coffee Check.** Le domande sono in `assessment.json` (testo, risposte, punteggi, visual).
Il risultato è la somma dei punteggi, mappata sui range dei `profiles`. Per aggiungere o modificare domande
basta il JSON; il campo `visual` sceglie uno dei visual esistenti (`transfer`, `inbox`, `network`, `channels`, `clock`).

**Contatti.** Il sito è statico: il form valida i campi lato client e compone un messaggio WhatsApp
precompilato verso il numero in `site.json` (`contact.phoneE164`). Se il browser blocca la nuova scheda,
viene mostrato un link manuale.

## Accessibilità

- Pulsanti reali per tutte le azioni, link reali per la navigazione; skip link; gerarchia h1 → h2 → h3.
- Coffee Check: `aria-pressed` sulle risposte, `aria-current="step"` sul progresso, regione `aria-live`,
  focus spostato sulla nuova domanda/risultato a ogni passaggio.
- Form: label reali, `aria-invalid`, `aria-describedby` per suggerimenti ed errori, focus sul primo campo errato.
- `prefers-reduced-motion`: niente track sticky né zoom, banner fermo, nessun parallax; la transizione
  crema → caffè resta come gradiente statico.
- Il rosa `#E04A95` è usato per testo solo in grandi dimensioni o su sfondo con contrasto adeguato;
  per il testo piccolo su marrone si usa la sola variante chiara `#F59AC6`.

## Palette

`#F5EFE2` crema (+ `#FBF8F1` più chiaro), `#E04A95` rosa (+ `#F59AC6` più chiaro),
`#4B2D20` marrone (+ `#3A2218`, `#2A1810`, `#1C100B` più scuri), `#FFFFFF`.

## Dipendenze

Solo `react`, `react-dom`, `three` (caricato in differita per la tazzina 3D) e i font variabili `@fontsource-variable/bricolage-grotesque` e
`@fontsource-variable/jetbrains-mono` (pagine) e `@fontsource-variable/inter` (solo dentro demo e visual: mockup,
anteprime dei moduli, visual del Coffee Check), serviti dal sito stesso (nessuna richiesta a Google Fonts).
In sviluppo: `vite` e `@vitejs/plugin-react`.

## Note

I testi di Privacy e Cookie (`site.json → legal`) descrivono il comportamento reale del sito
(nessun cookie, nessun tracciamento, form senza backend): vanno fatti validare da un consulente
prima della pubblicazione.
