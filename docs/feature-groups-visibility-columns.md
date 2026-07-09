# Gruppi, Visibilità per dispositivo, Colonne — riferimento rapido

> Documento breve di riferimento per tre feature correlate dell'editor: raggruppamento blocchi con sfondo condiviso, visibilità per viewport, layout a colonne dentro un gruppo.

**Stato:** Implementate — v1

---

## 1. Group (raggruppamento blocchi)

Un `Group` è un nodo contenitore nell'array `Page.blocks` che avvolge 2+ `Block` consecutivi sotto un **unico sfondo condiviso** (colore, gradiente, immagine, pattern), invece di richiedere di impostare lo stesso sfondo manualmente su ogni blocco.

- **Tipo dati**: `types/editor.types.ts` — `Group { id, type: 'group', background: BackgroundShape, blocks: Block[] }`. `Page.blocks: PageNode[]` = `(Block | Group)[]`. Un gruppo non annida un altro gruppo (un solo livello).
- **Helper centrale**: `lib/page-tree.ts` — `locateNode`, `updateNodeById`, `removeNodeById`, `flattenBlocks`, `groupWithNeighbor`, `dissolveGroup`, `removeFromGroup`. Ogni funzione dello store che deve attraversare l'array misto passa da qui, non reimplementa la discesa.
- **Regole di prodotto**:
  - Nav e footer non sono mai raggruppabili (restano root, gestiti via `site_globals`).
  - `moveBlockUp/Down` su un blocco in cima/fondo al gruppo si ferma lì (non esce dal gruppo).
  - Il gruppo si sposta/duplica/elimina come unità; duplicare rigenera gli id di gruppo e figli.
  - Eliminare un gruppo lo **scioglie** (i figli tornano a root), non cancella il contenuto.
  - Un gruppo con zero figli si auto-elimina.
- **Solo lo sfondo di sezione è toccato**: quando un blocco è dentro un gruppo, `EditorBlockWrapper`/worker azzerano solo `backgroundColor`/`backgroundColor2`/`bgType`/`backgroundImage`/`patternType` del blocco figlio. Padding, margini, bordo, colore testo e overlay decorativi interni (es. le card di Promo) **non vengono toccati** — restano quelli configurati dall'utente.
- **UI**: pannello sfondo del gruppo in `sidebar/block-editors/GroupBackground.tsx` (riusa `BackgroundManager`/`PatternManager` esistenti, niente controllo colore testo — ogni blocco mantiene il proprio). Controlli (copia/duplica/sposta/sciogli/raggruppa) nei componenti `EditorGroupWrapper.tsx` / `EditorBlockWrapper.tsx`.
- **Worker**: `generate-static.tsx` — `renderGroup()`/`renderBlock(..., inGroup)` generano il wrapper HTML con lo sfondo condiviso per il sito pubblicato, stessa logica dell'editor.
- **Limitazione nota**: nessun drag&drop per riordinare i blocchi dentro un gruppo. Workaround: rimuovi dal gruppo, riordina, ri-raggruppa nell'ordine voluto.

## 2. Visibilità per dispositivo

Ogni `Block` o `Group` può essere nascosto selettivamente su Desktop / Tablet / Mobile (in qualunque combinazione). Default: visibile ovunque.

- **Dato**: chiavi piatte `hideOnDesktop` / `hideOnTablet` / `hideOnMobile` dentro `block.style` (per un blocco) o `group.background` (per un gruppo) — stesso "posto" concettuale dello style in entrambi i casi.
- **Helper**: `lib/visibility.ts` — `isHiddenInViewport`, `hasAnyHiddenViewport`, `generateVisibilityCSS` (genera `display:none` riusando gli stessi due breakpoint già usati per gli stili responsive: `max-width:1024px` tablet, `max-width:768px` mobile).
- **UI**: `components/editor/VisibilityToggle.tsx` — popover con 3 toggle (Desktop/Tablet/Mobile), riusato identico in:
  - controlli hover di blocco/gruppo nel canvas;
  - sidebar **Struttura** a sinistra (icona sempre cliccabile su ogni riga, non solo se selezionata).
  - Prop `variant`/`onDarkBackground` adattano il colore dell'icona a seconda dello sfondo circostante (scuro nei controlli canvas, adattivo nella sidebar chiara).
- **Editor**: quando il blocco/gruppo è nascosto nel viewport correntemente simulato in toolbar, appare un overlay "Nascosto su [Viewport]" — resta comunque selezionabile/editabile, non sparisce dal canvas.
- **Worker**: `generateVisibilityCSS` iniettato per ogni blocco e gruppo nell'HTML pubblicato.

## 3. Colonne dentro un gruppo (span 12 colonne)

Solo per blocchi **dentro un gruppo**: possono occupare una frazione della riga (stile griglia Bootstrap a 12 colonne) invece del default one-per-row, per affiancarsi ad altri blocchi del gruppo.

- **Dato**: `groupSpan` (1–12, default 12 = riga intera) dentro `block.style`, con lo stesso pattern responsive già in uso per ogni altro stile: `style.groupSpan` per desktop, override opzionale in `responsiveStyles.tablet.groupSpan` / `.mobile.groupSpan`. **Nessun vincolo hardcoded**: ogni viewport è indipendente, l'utente decide anche su mobile.
- **Helper**: `lib/group-layout.ts` — `getGroupSpan`, `groupNeedsRowLayout` (il gruppo passa da `flex-column` a `flex-row + wrap` solo se almeno un figlio ha uno span parziale), `spanToWidthPercent`.
- **UI**: `components/editor/GroupColumnWidth.tsx` — preset leggibili (100/75/66/50/33/25%), mostrato in `ConfigSidebar.tsx` solo quando il blocco selezionato è dentro un gruppo (`locateNode(...).path === 'group'`). Nessun editor di blocco esistente è stato toccato.
- **Layout**: altezze diverse tra blocchi affiancati sono gestite naturalmente (`align-items: flex-start`, niente stretch forzato).
- **Worker**: `renderGroup`/`renderBlock` generano media query separate per ciascun breakpoint (desktop/tablet/mobile), coerenti con lo span configurato per ciascuno.
- **Limitazione nota**: nessun drag&drop orizzontale per riordinare colonne affiancate — stesso workaround del punto 1 (rimuovi dal gruppo, riordina, ri-raggruppa).

## Nota trasversale: barre controlli su viewport mobile simulato

Il canvas dell'editor simula tablet/mobile scalando (`transform: scale()`) un elemento a **larghezza fissa reale** (es. 390px per mobile), non ridimensionando la finestra del browser. Per questo motivo **le classi responsive di Tailwind (`sm:`, `md:`...) non funzionano** in questi componenti: valutano la viewport reale del browser, non la larghezza scalata del canvas. Ogni adattamento mobile-specifico nei controlli editor (es. barra ridotta con menu "⋯" per Group/Block) è condizionato esplicitamente sulla prop `viewport` dello store, non su breakpoint CSS.
