# AI HTML Generator — Specifiche Funzionali e Tecniche

> Documento di riferimento per il blocco Custom HTML con generazione AI: flusso di chiamata, prompt, placeholder editabili, rendering e sidebar.

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Flusso di una Generazione](#2-flusso-di-una-generazione)
3. [Server Action — `generateHtmlBlock`](#3-server-action--generatehtmlblock)
4. [Prompt AI](#4-prompt-ai)
5. [Placeholder Editabili (`data-chb-*`)](#5-placeholder-editabili-data-chb-)
6. [CSS Scoping](#6-css-scoping)
7. [Rendering — `resolveHtml`](#7-rendering--resolvehtml)
8. [Sidebar — `CustomHtmlEditor`](#8-sidebar--customhtmleditor)
9. [Gestione Errori e Fallback](#9-gestione-errori-e-fallback)
10. [File di Riferimento](#10-file-di-riferimento)

---

## 1. Panoramica

Il blocco **Custom HTML** permette di aggiungere a una pagina una sezione HTML/CSS/JS arbitraria generata o scritta manualmente. È l'unico blocco della piattaforma in cui il contenuto non segue uno schema strutturato — viene invece prodotto dall'AI o scritto direttamente dall'utente tramite editor di codice.

La piattaforma impone comunque:
- **Struttura HTML obbligatoria** (`<section class="cb-wrap">`) per l'integrazione con layout e pattern
- **CSS scoping automatico** per isolare le regole di ogni blocco
- **Placeholder dichiarativi** (`data-chb-*`) per rendere immagini, CTA e icone editabili dalla sidebar

---

## 2. Flusso di una Generazione

```
[Utente digita un prompt nella sidebar]
  → [handleSend() in CustomHtmlEditor]
  → [generateHtmlBlock() — server action]
      → [Autenticazione + check canUseAI]
      → [Composizione parti: system prompt + contesto progetto + messaggio utente]
      → [Chiamata modello PRIMARY (gemini-3-flash-preview)]
          → [Errore retriable o JSON malformato?]
              → [Retry con FALLBACK (gemini-3.1-flash-lite-preview)]
      → [parseModelResponse(): strip fences → JSON.parse → regex fallback]
      → [increment_ai_usage su Supabase]
      → [Ritorna { success: true, data: { html, css, js } }]
  → [updateContent({ html, css, js }) nel blocco]
  → [resolveHtml() trasforma i placeholder in HTML reale]
  → [scopeBlockCss() isola il CSS sotto #chb-BLOCKID]
```

**Modalità follow-up**: se il blocco ha già del codice (`content.html || content.css`), la chiamata è un follow-up — viene usato `FOLLOWUP_SYSTEM_PROMPT` e il codice corrente viene inviato come contesto da modificare. La chat history non viene inviata al server (evita gonfiamento del prompt).

---

## 3. Server Action — `generateHtmlBlock`

File: [`app/actions/ai-html-generator.ts`](../app/actions/ai-html-generator.ts)

### Input

```typescript
interface GenerateHtmlBlockInput {
  prompt: string;                        // testo dell'utente (max 3000 caratteri)
  referenceImageBase64?: string;         // immagine di riferimento (opzionale)
  referenceImageMime?: string;
  projectColors?: { bg, text, accent };  // colori del progetto
  projectFont?: string;                  // font del progetto
  history?: { role, text }[];            // chat history (non inviata in follow-up)
  currentHtml?: string;                  // codice esistente (solo in follow-up)
  currentCss?: string;
  currentJs?: string;
}
```

### Output

```typescript
| { success: true; data: { html: string; css: string; js: string } }
| { success: false; error: string }
```

### Validazioni pre-chiamata

- Utente autenticato (`supabase.auth.getUser`)
- Crediti AI disponibili (`canUseAI(user.id)`)
- Prompt non vuoto e ≤ 3000 caratteri

### Modelli e Timeout

| Ruolo | Modello | Timeout |
|---|---|---|
| Primary | `gemini-3-flash-preview` | 90s (nuova gen) / 45s (follow-up) |
| Fallback | `gemini-3.1-flash-lite-preview` | idem |

Il fallback viene attivato su errori HTTP retriable (429, 500, 503, 403) **e** su `SyntaxError` di parsing JSON.

### Parsing della risposta — `parseModelResponse`

Tre livelli di tolleranza:

1. `JSON.parse(raw)` diretto
2. Estrae il primo `{...}` dalla stringa (gestisce testo prima/dopo)
3. Regex field-by-field su `"html":"..."` — ultimo resort se il JSON è frammentato

Se anche il terzo livello fallisce → lancia `SyntaxError` → attiva il fallback model.

### Incremento usage

Avviene **dopo** il parsing riuscito, **prima** di restituire il risultato. Se primary fallisce e fallback riesce, l'usage viene incrementato una sola volta.

---

## 4. Prompt AI

### `SYSTEM_PROMPT` — nuova generazione

Il prompt è strutturato in sezioni separate da doppia riga:

| Sezione | Contenuto |
|---|---|
| **OUTPUT FORMAT** | Risposta solo JSON `{"html":"...","css":"...","js":"..."}`, no markdown fences |
| **HTML STRUCTURE** | Root `<section class="cb-wrap">`, `<div class="cb-inner">` centrato, prefisso `cb-` su tutte le classi |
| **CSS RULES** | `.cb-wrap` solo `color: var(--block-color)` (no bg/padding/margin), font-size tramite vars globali (`--global-h1-fs` ecc.), `var(--btn-radius)` per i pulsanti, `color:inherit` su tutti i testi |
| **RESPONSIVE** | Solo `@container` (mai `@media`), breakpoint obbligatori a `1024px` e `640px` |
| **EDITABLE PLACEHOLDERS** | Regole per `data-chb-img`, `data-chb-cta`, `data-chb-svg`, `data-chb-icon` (vedi sezione 5) |
| **DESIGN QUALITY** | Whitespace generoso, gerarchia chiara, ombre leggere, copy reale (no lorem ipsum) |
| **VIEWPORT VISIBILITY** | Nessun `display:none` / `opacity:0` su elementi con contenuto |
| **REFERENCE IMAGE** | Se fornita, è la fonte primaria del design — il testo è contesto secondario |
| **MOBILE SAFETY** | Collasso a colonna singola a 640px, no `position:absolute` su testi, no larghezze px senza `max-width:100%` |
| **FORBIDDEN** | Lista negativa: no bg su `.cb-wrap`, no `<img>` tag, no SVG inline per icone, no `@media`, no `text-transform:uppercase`, no `color` su testi, ecc. |

### Contesto di progetto (appeso in coda al system text)

```
PROJECT FONT: "Inter" — already loaded on the page, declare it via font-family in CSS.
ACCENT COLOR (use for highlights/borders/accents only, NOT section background): #3b82f6
```

Entrambi opzionali — inclusi solo se il progetto ha font/colore configurati.

### `FOLLOWUP_SYSTEM_PROMPT` — modifica su codice esistente

Prompt più compatto per i follow-up. Include le stesse regole critiche in forma condensata:
- Struttura HTML (`cb-wrap`, no bg/padding/margin)
- `@container` not `@media`
- Regole complete di tutti e 4 i placeholder (`data-chb-img` obbligatorio se il layout ha uno slot immagine, `data-chb-cta` vuoto, `data-chb-svg` con encoding completo, `data-chb-icon` con nome Lucide)
- Font-size vars e `color:inherit`
- Visibilità su tutti i viewport
- Collasso mobile a 640px
- **"Return COMPLETE updated code"** — preservare tutto il codice non modificato

### Messaggio utente in follow-up

```
CURRENT CODE TO MODIFY:
```html
<section class="cb-wrap">...</section>
```
```css
.cb-inner { ... }
```
```js
(vuoto o codice esistente)
```

USER REQUEST: <testo dell'utente>
```

La chat history non viene inclusa nel messaggio — solo il codice corrente + la richiesta.

---

## 5. Placeholder Editabili (`data-chb-*`)

I placeholder sono elementi HTML con attributi `data-chb-*` che l'AI inserisce nel markup. Il renderer (`resolveHtml`) li sostituisce con HTML reale a runtime; la sidebar li espone come campi editabili.

### `data-chb-img` — Immagini

```html
<div data-chb-img="0" data-chb-ratio="16:9" data-chb-alt="Screenshot app"></div>
```

- `N` parte da 0, incrementa per ogni immagine nel blocco
- `data-chb-ratio`: rapporto W:H (es. `"16:9"`, `"1:1"`, `"9:16"`)
- **OBBLIGATORIO** quando il layout prevede uno slot immagine — mai omesso
- Il container div viene stilato via CSS; il placeholder in sé non va stilato
- **Mai usare `<img>` tag** per immagini di contenuto

Valori editabili dalla sidebar: src, alt, ratio, arrotondamento, larghezza %, link.

Chiavi nel content: `cbImg_N_src`, `cbImg_N_alt`, `cbImg_N_ratio`, `cbImg_N_radius`, `cbImg_N_width`, `cbImg_N_link`

### `data-chb-cta` — CTA Button

```html
<a data-chb-cta="0" data-chb-label="Scopri di più" data-chb-url="#"></a>
```

- Tag `<a>` **vuoto** — nessun contenuto figlio
- Il renderer genera il pulsante stilato con `getButtonStyle()` e `getButtonClass()` del progetto
- `data-chb-theme` opzionale: `"primary"` (default) | `"secondary"`

Valori editabili dalla sidebar: label, url, tema.

Chiavi nel content: `cbCta_N_label`, `cbCta_N_url`, `cbCta_N_theme`

### `data-chb-svg` — SVG Decorativi

```html
<div data-chb-svg="0" data-chb-svg-markup="&lt;svg ...&gt;&lt;/svg&gt;"></div>
```

- Per forme decorative, blob, illustrazioni, pattern geometrici
- Il markup SVG deve essere **completamente encodato**: `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `&` → `&amp;`
- Il renderer decodifica e inietta l'SVG come innerHTML

Valori editabili dalla sidebar: markup SVG raw (textarea monospace).

Chiavi nel content: `cbSvg_N_markup`

### `data-chb-icon` — Icone Lucide

```html
<span data-chb-icon="zap"></span>
<span data-chb-icon="arrow-right"></span>
```

- `ICONNAME` è il nome Lucide in kebab-case (es. `zap`, `heart`, `shield`, `arrow-right`, `check-circle`)
- **Mai SVG inline per icone** — sempre `data-chb-icon`
- Il renderer server-side converte con `renderToStaticMarkup`; client-side viene risolto via `useEffect` in `CustomHtmlBlock`
- Dimensione e colore via CSS sul `<span>` (colore eredita per default)

Valori editabili dalla sidebar: nome icona (picker Lucide nativo tramite `IconManager`).

Chiavi nel content: `cbIcon_ICONNAME` (chiave = nome icona originale)

### `data-chb-text` — Nodi testo (generato dalla sidebar)

```html
<h2 data-chb-text="0">Titolo della sezione</h2>
<p data-chb-text="1">Testo descrittivo…</p>
```

- **Non generato dall'AI** — viene stampato dalla sidebar (`parseTextNodes`) al momento dell'editing
- Permette di editare il contenuto testuale e le proprietà tipografiche nodo per nodo
- Override tipografici scritti nel CSS del blocco sotto il commento `/* chb-typo */`

---

## 6. CSS Scoping

File: [`components/blocks/visual/CustomHtmlBlock.scope.ts`](../components/blocks/visual/CustomHtmlBlock.scope.ts)

Ogni blocco Custom HTML riceve uno scope CSS unico basato sull'ID del blocco:

```
scopeId = "chb-{blockId}"
```

La funzione `scopeBlockCss(css, scopeId)` trasforma tutte le regole CSS:

| Input | Output |
|---|---|
| `.cb-grid { display: grid }` | `#chb-abc .cb-grid { display: grid }` |
| `:root { --color: red }` | `#chb-abc { --color: red }` |
| `@container (max-width:640px) { .cb-grid { … } }` | `@container (max-width:640px) { #chb-abc .cb-grid { … } }` |
| `@keyframes slide { … }` | invariato |
| `@font-face { … }` | invariato |

I blocchi `@media`, `@container`, `@supports`, `@layer` vengono ricorsivamente scopati all'interno. `@keyframes` e `@font-face` passano invariati.

---

## 7. Rendering — `resolveHtml`

File: [`components/blocks/visual/CustomHtmlBlock.resolve.ts`](../components/blocks/visual/CustomHtmlBlock.resolve.ts)

`resolveHtml(html, content, project, isStatic, imageMemoryCache)` viene chiamato al render del blocco (sia client che server/static). Trasforma in sequenza:

1. **`data-chb-img`** → wrapper `position:relative` con `padding-bottom` proporzionale al ratio; `<img>` se src presente, placeholder grigio con icona se assente; link opzionale
2. **`data-chb-cta`** → `<a>` stilato con `getButtonStyle()` e `getButtonClass()` del progetto; `formatLink()` per link interni vs esterni
3. **`data-chb-svg`** → innerHTML sostituito con il markup SVG decodificato (da content override o dal default nell'attributo)
4. **`data-chb-icon`** → `<span>` con SVG Lucide iniettato (server: `renderToStaticMarkup`; client: `useEffect`)

Il parametro `isStatic` cambia il comportamento di `formatLink` e `resolveImageUrl` per la generazione statica.

### `parseChbPlaceholders`

Funzione di supporto che estrae le liste di placeholder dall'HTML grezzo — usata dalla sidebar per sapere quante e quali sezioni "Immagini", "CTA", "Icone", "SVG" mostrare.

---

## 8. Sidebar — `CustomHtmlEditor`

File: [`components/blocks/sidebar/block-editors/CustomHtml.tsx`](../components/blocks/sidebar/block-editors/CustomHtml.tsx)

### Chat AI

- Textarea per il prompt (Enter per inviare, Shift+Enter per andare a capo)
- Pulsante upload immagine di riferimento (base64, mostrata come anteprima)
- Chat history locale visualizzata come bubble (user/assistant)
- Stato `hasGenerated`: se `true` e il blocco ha già codice, la chiamata diventa follow-up

### Sezione "Contenuto"

Visibile solo se il blocco ha placeholder parsati. Sezioni collassabili per tipo:

| Sezione | Contenuto |
|---|---|
| **Testi** | Un editor rich text per ogni nodo `data-chb-text`; tag selector (h1-h6, p, span); controlli dimensione/bold/italic via `TypographyFields` |
| **Immagini** | Upload immagine, alt text, ratio selector (6 preset), larghezza %, arrotondamento, link opzionale |
| **CTA** | Label, URL (`LinkSelector`), tema primary/secondary tramite `CTAManager` |
| **Icone** | Picker Lucide nativo (`IconManager`) per ogni `data-chb-icon` |
| **SVG** | Textarea monospace per il markup SVG raw, con anteprima live |

### Sezione "Codice"

Tre `CodeTextarea` collassabili (HTML, CSS, JS) per editing diretto. Il CSS viene gestito come raw — lo scoping viene applicato a runtime, non in sidebar.

### Sezione "Stile della Sezione"

Stessi controlli degli altri blocchi: layout/spaziatura, sfondo/colori, pattern decorativo, bordo/ombra, anchor.

### Typography override

`makeNodeStyleBridge` costruisce un bridge per ogni nodo testo: gli stili vengono salvati nel `blockStyle` come `cbText0Size`, `cbText0Bold`, ecc. e scritti nel CSS del blocco come:

```css
/* chb-typo */
[data-chb-text="0"] { font-size: 48px !important; font-weight: 700 !important; }
```

Quando l'AI rigenera il blocco, il CSS `/* chb-typo */` viene rimosso automaticamente (la struttura HTML è cambiata, i nodi sono diversi).

---

## 9. Gestione Errori e Fallback

| Scenario | Comportamento |
|---|---|
| Prompt vuoto o > 3000 car. | Errore restituito senza chiamata AI |
| Crediti AI esauriti | `canUseAI` restituisce `allowed: false` → errore mostrato in sidebar |
| Timeout (45s/90s) | `Promise.race` rigetta → messaggio "risposta troppo lenta, riprova" |
| Errori HTTP 429/500/503/403 | Retry automatico con modello fallback |
| JSON malformato (primary) | `SyntaxError` → retry con modello fallback |
| JSON malformato (fallback) | Errore generico restituito al client |
| `parsed.html` non stringa | `{ success: false, error: 'Risposta AI non valida.' }` |

Il fallback non è progettato per gestire JSON malformati — è principalmente utile in caso di indisponibilità o rate-limit del modello primary.

---

## 10. File di Riferimento

| File | Ruolo |
|---|---|
| [`app/actions/ai-html-block.ts`](../app/actions/ai-html-block.ts) | Server action thin wrapper: auth, canUseAI, usage increment |
| [`lib/ai/html-block.ts`](../lib/ai/html-block.ts) | Logica core: `generateHtmlBlock`, `parseModelResponse`, `callModel` |
| [`lib/ai/prompts/html-block.ts`](../lib/ai/prompts/html-block.ts) | `buildHtmlBlockPrompt` (system + followup), sezioni condizionali |
| [`components/blocks/visual/CustomHtmlBlock.resolve.ts`](../components/blocks/visual/CustomHtmlBlock.resolve.ts) | `resolveHtml`, `parseChbPlaceholders`, `lucideIconToSvg` |
| [`components/blocks/visual/CustomHtmlBlock.scope.ts`](../components/blocks/visual/CustomHtmlBlock.scope.ts) | `scopeBlockCss` — scoping CSS per blocco |
| [`components/blocks/visual/CustomHtmlBlock.tsx`](../components/blocks/visual/CustomHtmlBlock.tsx) | Componente React del blocco (client-side icon resolution) |
| [`components/blocks/sidebar/block-editors/CustomHtml.tsx`](../components/blocks/sidebar/block-editors/CustomHtml.tsx) | Editor sidebar con chat AI e sezioni contenuto |
| [`lib/permissions.ts`](../lib/permissions.ts) | `canUseAI()` — check crediti |
