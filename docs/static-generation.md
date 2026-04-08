# Generazione Pagine Statiche — HTML, CSS, Vanilla JS

> Come i blocchi dell'editor diventano un sito HTML statico.

---

## Due modalita di rendering: Editor vs Sito live

Lo stesso componente React (es. `HeroBlock.tsx`) viene usato in due contesti completamente diversi. La prop `isStatic` discrimina il comportamento.

### Editor (Canvas)

```
Componente React vivo in un'app Next.js
├── isStatic = false
├── Rendering: React DOM nel browser (client-side)
├── CSS: Tailwind JIT + CSS variables calcolate da useBlockStyles()
├── Interattivita: click per selezionare, drag per riordinare, inline edit
├── Dati: live da Zustand store, aggiornamenti in tempo reale
├── Immagini: risolte via Supabase public URL (o memory cache per upload recenti)
├── Nav/Footer: dai blocchi della pagina corrente (ancora dentro page.blocks)
├── Viewport: simulato (desktop/tablet/mobile) con CSS transform + width
└── JS: React runtime completo, hooks, state, eventi
```

### Sito live (HTML statico)

```
Stringa HTML generata server-side con renderToStaticMarkup()
├── isStatic = true
├── Rendering: HTML statico puro (zero React runtime)
├── CSS: Tailwind compilato in styles.css + CSS variables inline per blocco
├── Interattivita: solo vanilla JS minimale (slider, menu, animazioni)
├── Dati: snapshot dal DB al momento del deploy (immutabile fino al prossimo deploy)
├── Immagini: path relativi /assets/img_hash.webp serviti da Cloudflare CDN
├── Nav/Footer: da site_globals (tabella separata, per lingua)
├── Viewport: responsive reale via media queries CSS
└── JS: ~2KB vanilla, IntersectionObserver, nessun framework
```

### Differenze chiave per i componenti

Ogni componente visuale riceve `isStatic` e si comporta diversamente:

**Link e navigazione:**
- Editor: `<div>` non cliccabile (evita navigazione accidentale)
- Live: `<a href="...">` con link reali

**Inline editing:**
- Editor: `contentEditable` su testi, `onInlineEdit` callback
- Live: testo statico, nessun attributo editable

**Immagini:**
- Editor: `resolveImageUrl(path, project, memoryCache, false)` → URL Supabase completo
- Live: `resolveImageUrl(path, project, {}, true)` → path relativo `/assets/...`

**Form contatto:**
- Editor: form visuale non inviabile
- Live: form con `action` (Formspree, Netlify Forms, o custom endpoint)

**Animazioni:**
- Editor: nessuna animazione (per non interferire con l'editing)
- Live: `data-siti-anim` + IntersectionObserver + transizioni CSS

**FAQ accordion:**
- Editor: sempre aperto per editing
- Live: `<details>/<summary>` nativo, cliccabile

**Slider/Carousel:**
- Editor: scroll orizzontale base, nessun JS
- Live: frecce con `onclick` JS per navigazione smooth

**Responsive:**
- Editor: simulato con `transform: scale()` e larghezza fissa del canvas
- Live: media queries CSS reali (`@media max-width: 1024px`, `768px`)

### Cosa cambia nel CSS

**Editor:**
```
Blocco → getBlockCSSVariables(block, project, currentViewport)
                                                    ↑
                                        uno solo alla volta
```
Le variabili CSS vengono calcolate per il viewport selezionato nell'editor (desktop/tablet/mobile) e applicate come stile inline.

**Live:**
```
Blocco → generateBlockCSS(blockId, block, project)
              ↓
         #block-id { --block-pt: 80px; }
         @media (max-width: 1024px) { #block-id { --block-pt: 60px; } }
         @media (max-width: 768px)  { #block-id { --block-pt: 40px; } }
```
Tutte e tre le viewport sono compilate in un unico `<style>` con media queries reali.

---

## Come i blocchi diventano HTML

File: `lib/generate-static.tsx`

```
Block JSON (dal DB)
  ↓
StaticRegistry[type] → trova il componente React
  ↓
renderToStaticMarkup(<Component {...props} isStatic={true} />)
  ↓
Stringa HTML pura (senza hydration markers)
  ↓
Wrapped in <div id="block-{id}"> con <style> CSS scoped
```

Il `StaticRegistry` e costruito automaticamente da `BLOCK_DEFINITIONS` — prende il campo `.visual` di ogni definizione. Se un blocco non ha `.visual`, viene ignorato nel build statico.

---

## Iniezione nav/footer globali

Nav e footer non sono nei `blocks` della pagina. Vengono dalla tabella `site_globals` (uno per lingua per tipo).

```typescript
const navGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'navigation');
const footerGlobal = siteGlobals.find(g => g.language === pageLang && g.type === 'footer');

const allBlocks = [navBlock, ...pageContent, footerBlock];
```

Il footer riceve un fallback per il logo: se non ha un logo proprio, usa quello della nav (`_navLogoFallback`). Riceve anche `_language` per link localizzati.

---

## Struttura HTML output

```html
<!DOCTYPE html>
<html lang="{lingua}" class="scroll-smooth">
<head>
    <!-- SEO -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="{fullPageUrl}">
    <link rel="alternate" hreflang="it" href="..." />
    <link rel="alternate" hreflang="en" href="..." />
    <link rel="alternate" hreflang="x-default" href="..." />
    <title>{seoTitle}</title>
    <meta name="description" content="{seoDescription}">
    <meta name="robots" content="index, follow">

    <!-- Open Graph + Twitter -->
    <meta property="og:title" content="...">
    <meta property="og:description" content="...">
    <meta property="og:image" content="...">

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "LocalBusiness", ... }
    </script>

    <!-- Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family={font}:wght@400;500;600;700;800">

    <!-- Preload LCP image -->
    <link rel="preload" as="image" href="/assets/hero-bg.webp" fetchpriority="high">

    <!-- Tailwind CSS compilato -->
    <link rel="stylesheet" href="/assets/styles.css">

    <!-- CSS inline: variables globali + responsive + animazioni -->
    <style>
        :root {
            --primary: #3b82f6;
            --secondary: #10b981;
            --font-main: 'Outfit', sans-serif;
            --global-h1-fs: 48px;
            /* ... variabili comuni deduplicate ... */
        }
        @media (max-width: 1024px) { :root { --global-h1-fs: 40px; } }
        @media (max-width: 768px)  { :root { --global-h1-fs: 32px; } }

        /* Keyframes animazioni */
        @keyframes fade-in-up { ... }

        /* Framework animazioni blocchi */
        [data-siti-anim] { opacity: 0; transition: ...; }
        [data-siti-anim="slide-up"] { transform: translate3d(0, 30px, 0); }
        [data-siti-anim].siti-anim-active { opacity: 1; transform: none; }
    </style>

    <!-- Script utente (head) -->
    {customScriptsHead}
</head>
<body>
    <main>
        <!-- Per ogni blocco: <style> scoped + <div id="block-{id}"> -->
        {renderedBlocks}
    </main>

    <!-- Vanilla JS globale -->
    <script>
        // Sticky nav, menu mobile, IntersectionObserver animazioni
    </script>

    <!-- Script utente (body) -->
    {customScriptsBody}
</body>
</html>
```

---

## Sistema CSS

### CSS Variables per blocco

Ogni blocco ha il proprio `<style>` scoped con variabili CSS responsive:

```css
#block-a1b2c3d4 {
    --block-bg: #ffffff;
    --block-color: #1a1a1a;
    --block-pt: 80px;
    --block-pb: 80px;
    --block-px: 24px;
    --block-gap: 32px;
    --block-align: center;
    --block-max-width: 1200px;
    --block-radius: 0px;
    --block-border-w: 0px;
    --block-border-c: transparent;
}

@media (max-width: 1024px) {
    #block-a1b2c3d4 {
        --block-pt: 60px;
        --block-pb: 60px;
    }
}

@media (max-width: 768px) {
    #block-a1b2c3d4 {
        --block-pt: 40px;
        --block-pb: 40px;
        --block-px: 16px;
    }
}
```

Breakpoint: **desktop** (default), **tablet** (max 1024px), **mobile** (max 768px).

Le variabili sono calcolate da `getBlockCSSVariables()` in `lib/responsive-utils.ts`. Ogni block definition ha un `styleMapper` che mappa i valori di stile alle CSS variables. Se non ha un mapper, usa `getBaseStyleVars()` come fallback.

### Come funziona il calcolo

```typescript
// Per ogni viewport, calcola le variabili
const desktopVars = getBlockCSSVariables(block, project, 'desktop');
const tabletVars  = getBlockCSSVariables(block, project, 'tablet');
const mobileVars  = getBlockCSSVariables(block, project, 'mobile');

// Nel CSS generato, tablet e mobile includono solo le variabili
// che DIFFERISCONO dal viewport precedente (ottimizzazione)
```

### Deduplicazione variabili comuni

`computeCommonVars()` trova le variabili identiche in TUTTI i blocchi e le alza a `:root`:

```css
:root {
    --block-px: 24px;       /* uguale per tutti */
    --block-color: #1a1a1a; /* uguale per tutti */
}
```

Riduce la dimensione del CSS evitando ripetizioni. Le variabili non comuni restano scoped nel singolo blocco.

### Tipografia responsive globale

Le dimensioni dei titoli sono definite nei project settings e scalano automaticamente per viewport:

```css
:root {
    --global-h1-fs: 48px;
    --global-h2-fs: 36px;
    --global-h3-fs: 28px;
    --global-body-fs: 16px;
}
@media (max-width: 1024px) {
    :root {
        --global-h1-fs: 40px;
        --global-h2-fs: 30px;
    }
}
@media (max-width: 768px) {
    :root {
        --global-h1-fs: 32px;
        --global-h2-fs: 24px;
        --global-body-fs: 15px;
    }
}
```

I blocchi usano queste variabili globali come default, ma possono sovrascriverle con valori propri (es. `--hero-h1-fs`).

### Variabili specifiche per tipo blocco

Ogni tipo di blocco puo avere variabili aggiuntive oltre a quelle base. Esempio Hero:

```css
#block-hero-123 {
    --hero-h1-fs: 56px;
    --hero-subtitle-fs: 20px;
    --bg-size: cover;
    --bg-pos: center;
    --hero-overlay: rgba(0,0,0,0.3);
}
```

Queste sono definite dal `styleMapper` nella block definition.

---

## Vanilla JS nei siti statici

Zero framework. Solo script inline minimali per interattivita essenziale. Tutto il resto e CSS puro.

### Script globali (ogni pagina)

Iniettati alla fine del `<body>` in `generate-static.tsx`.

**1. Sticky nav**

Detecta lo scroll e aggiunge stili alla navigation bar fissa:

```javascript
// Quando scroll > 20px:
//   - background: blur + colore semi-trasparente
//   - shadow sottile
//   - riduce padding
// Quando torna a 0:
//   - rimuove gli stili
window.addEventListener('load', handler);
```

**2. Menu mobile**

Toggle del menu hamburger:

```javascript
// Click su [data-menu-toggle]:
//   - togga attributo [data-open] sul [data-menu]
//   - il CSS gestisce la visibilita con [data-open] selector
document.addEventListener('click', handler);
```

**3. Animazioni blocchi (IntersectionObserver)**

Osserva gli elementi con `data-siti-anim` e li anima quando entrano nel viewport:

```javascript
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('siti-anim-active');
            observer.unobserve(entry.target); // anima una volta sola
        }
    });
}, {
    threshold: 0.05,          // 5% dell'elemento visibile
    rootMargin: '0px 0px -60px 0px'  // margine inferiore
});

document.querySelectorAll('[data-siti-anim]').forEach(function(el) {
    // Se gia visibile al load, anima subito
    // Altrimenti, osserva
});
```

### Script specifici per blocco

Alcuni blocchi iniettano `<script>` inline via `dangerouslySetInnerHTML`. Ogni script e un IIFE autocontenuto.

**Slider/Carousel** — usato da Gallery, Pricing, Cards, Benefits (variante slider)

```javascript
(function() {
    var container = document.currentScript.closest('...').querySelector('.scroll-container');
    var leftArrow = container.parentElement.querySelector('[data-arrow="left"]');
    var rightArrow = container.parentElement.querySelector('[data-arrow="right"]');

    var getStep = function() {
        var card = container.querySelector('div');
        var gap = parseInt(getComputedStyle(container).gap) || 16;
        return card.offsetWidth + gap;
    };

    leftArrow.onclick = function() {
        container.scrollBy({ left: -getStep(), behavior: 'smooth' });
    };
    rightArrow.onclick = function() {
        container.scrollBy({ left: getStep(), behavior: 'smooth' });
    };
})();
```

**FAQ Accordion** — Nessun JS. Usa `<details>/<summary>` nativo del browser. CSS gestisce le animazioni con `group-open:` (Tailwind).

### Sistema animazioni

Data attributes sugli elementi:

```html
<div data-siti-anim="slide-up"
     data-siti-anim-duration="0.8"
     data-siti-anim-delay="0.2">
```

**Tipi disponibili:**
- `slide-up` — entra dal basso
- `slide-down` — entra dall'alto
- `slide-left` — entra da destra
- `slide-right` — entra da sinistra
- `zoom-in` — zoom in con fade
- `none` — nessuna animazione

**CSS framework:**

```css
/* Stato iniziale: nascosto */
[data-siti-anim] {
    opacity: 0;
    transition-property: opacity, transform, filter;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    transition-duration: var(--siti-anim-duration, 0.8s);
    transition-delay: var(--siti-anim-delay, 0s);
    will-change: transform, opacity;
}

/* Transform iniziale per tipo */
[data-siti-anim="slide-up"]    { transform: translate3d(0, 30px, 0); }
[data-siti-anim="slide-down"]  { transform: translate3d(0, -30px, 0); }
[data-siti-anim="slide-left"]  { transform: translate3d(30px, 0, 0); }
[data-siti-anim="slide-right"] { transform: translate3d(-30px, 0, 0); }
[data-siti-anim="zoom-in"]     { transform: scale(0.92); }

/* Stato attivo: visibile */
[data-siti-anim].siti-anim-active {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: none;
}

/* Nessuna animazione */
[data-siti-anim="none"] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
}
```

L'IntersectionObserver aggiunge la classe `.siti-anim-active` quando l'elemento entra nel viewport. La transizione CSS fa il resto.

---

## SEO statico

### Canonical e hreflang

Ogni pagina ha il suo `canonical` e link `alternate` per tutte le varianti lingua:

```html
<link rel="canonical" href="https://example.com/about">
<link rel="alternate" hreflang="it" href="https://example.com/about" />
<link rel="alternate" hreflang="en" href="https://example.com/en/about" />
<link rel="alternate" hreflang="x-default" href="https://example.com/about" />
```

Le varianti vengono trovate tramite `translations_group_id` (se presente) o per slug matching.

### Schema.org

Se i business details sono compilati, viene iniettato JSON-LD:

```json
{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Pizzeria Roma",
    "url": "https://pizzeria-roma.pages.dev",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via Roma 1",
        "addressLocality": "Roma"
    },
    "telephone": "+39 06 1234567"
}
```

### Robots

Il meta tag `robots` rispetta il flag `seo.indexable`:
- `true` (default): `<meta name="robots" content="index, follow">`
- `false`: `<meta name="robots" content="noindex, nofollow">`

Il `robots.txt` elenca esplicitamente le pagine con `noindex` come Disallow.

### Sitemap

Generata da `generateSitemap()` in `lib/generate-static.tsx`. Include tutte le pagine con:
- `<loc>` con URL completo e prefisso lingua
- `<lastmod>` con data corrente
- `<changefreq>` weekly
- `<priority>` 1.0 per home, 0.8 per le altre
- `<xhtml:link>` per ogni variante lingua

---

## Cosa NON c'e nel sito statico

- Zero React runtime
- Zero Node.js
- Zero framework JS
- Zero fetch/API call a runtime
- Zero database query
- Zero server-side rendering

Il sito e puro HTML + CSS + ~2KB di vanilla JS. Questo significa:
- Caricamento istantaneo (servito da CDN Cloudflare)
- Funziona offline (una volta cached)
- Nessun costo server per servire le pagine
- Sicurezza massima (nessun backend da attaccare)
- Score Lighthouse 95-100 su tutti i parametri

---

## File di riferimento

- `lib/generate-static.tsx` — Generazione HTML, `renderBlock()`, `generateStaticHtml()`, sitemap, robots
- `lib/responsive-utils.ts` — `getBlockCSSVariables()`, `computeCommonVars()`, `generateBlockCSS()`
- `lib/base-style-mapper.ts` — `getBaseStyleVars()` (variabili CSS base per tutti i blocchi)
- `lib/hooks/useBlockStyles.ts` — `getBlockStyles()` (merge stili desktop/tablet/mobile)
- `lib/image-utils.ts` — `resolveImageUrl()` (risoluzione path immagini editor vs statico)
- `app/actions/deploy.ts` — Pipeline deploy completa (vedi `infrastructure.md`)
