# Performance & Loading Optimization Report

Data: 2026-04-02  
Autore: Analisi e implementazione assistita da Claude Code

---

## Problema 1 — Perché la MAIN NAV appare subito e l'HERO dopo

### Diagnosi

In LIVE ogni blocco veniva wrappato in:

```html
<div id="block-xyz" class="transition-all duration-500">...</div>
```

Questo significa che **ogni singolo blocco** sulla pagina aveva una transizione CSS attiva da subito al caricamento. La Main Nav appare immediatamente perché è un elemento `nav` senza questa classe, ma tutti gli altri elementi (incluso l'Hero) partivano con la transizione attiva.

Il secondo fattore: il sistema di animazione `data-siti-anim` imposta `opacity: 0` su tutti gli elementi animati. Lo script JS che li riattiva (aggiungendo `.siti-anim-active`) usava un `IntersectionObserver` con `rootMargin: '0px 0px -50px 0px'`. Questo significa che anche gli elementi **già visibili al caricamento** dovevano aspettare che l'observer scattasse — creando un flash di invisibilità (FOIC — Flash of Invisible Content) prima che la transizione li portasse a `opacity: 1`.

### Fix implementata

**`lib/generate-static.tsx` riga 347:**
```diff
- const blockWrapper = (inner) => `${styleWrapper}<div id="${blockId}" class="transition-all duration-500">${inner}</div>`;
+ const blockWrapper = (inner) => `${styleWrapper}<div id="${blockId}">${inner}</div>`;
```

**Script animazioni in `generate-static.tsx`:**
```diff
- // Observer con rootMargin negativo per tutti gli elementi
- document.querySelectorAll('[data-siti-anim]').forEach(el => {
-   if (el.getAttribute('data-siti-anim') !== 'none') {
-     animObserver.observe(el);
-   } else {
-     el.classList.add('siti-anim-active');
-   }
- });

+ // Elementi già visibili → attivazione immediata senza observer
+ const vh = window.innerHeight;
+ document.querySelectorAll('[data-siti-anim]').forEach(el => {
+   const anim = el.getAttribute('data-siti-anim');
+   if (anim === 'none') { el.classList.add('siti-anim-active'); return; }
+   const rect = el.getBoundingClientRect();
+   if (rect.top < vh && rect.bottom > 0) {
+     el.classList.add('siti-anim-active'); // above-fold: immediato
+   } else {
+     animObserver.observe(el); // below-fold: scroll-driven
+   }
+ });
```

### Perché è meglio

- Nessun flash di invisibilità per i contenuti above-the-fold
- Le animazioni scroll-driven restano attive per i blocchi sotto la viewport
- Zero overhead CSS inutile su ogni blocco

---

## Problema 2 — `transition-all duration-500` hardcoded ovunque

### Diagnosi

`transition-all` applica una transizione CSS a **ogni** proprietà modificabile (opacity, transform, width, height, color, background, border, padding, margin, font-size…). Su ogni elemento di testo, sezione e container questo:

1. Rallenta la prima paint perché il browser crea "stacking context" e layer GPU anche dove non servono
2. Causa ritardi visivi di 500–700ms su elementi che non cambiano mai (testi statici, sezioni)
3. Interferisce con il sistema `data-siti-anim`: un elemento con `opacity: 0` + `transition-all duration-500` impiega 500ms per diventare visibile anche dopo che il JS ha aggiunto `.siti-anim-active`

### Fix implementata

Rimosse da tutti i file seguenti:

| File | Occorrenze rimosse |
|---|---|
| `generate-static.tsx` | `blockWrapper` wrapper |
| `Hero.tsx` | 10+ (sezioni, bg, overlay, pattern, testi, tutti e 3 i layout) |
| `TextBlock.tsx` | 6 |
| `FaqBlock.tsx` | 3 |
| `CardsBlock.tsx` | 7 |
| `Benefits.tsx` | 5 |
| `HowItWorks.tsx` | 4 |
| `PricingBlock.tsx` | 8 |
| `ContactBlock.tsx` | 1 (sostituita con `transition-[filter]` per hover mappa) |
| `SingleImage.tsx` | 1 |
| `GalleryBlock.tsx` | 1 (sostituita con `transition-[transform,box-shadow]` per hover immagini) |
| `ImageTextBlock.tsx` | 4 |
| `DividerBlock.tsx` | 1 |
| `EmbedBlock.tsx` | 4 |
| `PdfBlock.tsx` | 1 |

**Mantenute** (intenzionali, solo dove c'è vera interazione UI):
- `Navigation.tsx` + `MobileMenu.tsx` — slide del pannello mobile e animazione icona hamburger
- `GalleryBlock.tsx` hover immagini → sostituita con `transition-[transform,box-shadow]`
- `ContactBlock.tsx` hover mappa → sostituita con `transition-[filter]`

### Perché è meglio

`transition-all` è un anti-pattern noto: applica transizioni a proprietà che non cambieranno mai, costringendo il browser a creare composite layers inutili. La regola corretta è dichiarare esplicitamente le proprietà che devono transitare (`transition-[transform,opacity]`, `transition-[filter]`, ecc.) o non usare transizioni sugli elementi statici.

---

## Problema 3 — Hero: effetto di comparsa sgradevole con pattern + immagine sfondo

### Diagnosi

Tre cause concorrenti:

1. **`transition-all duration-700` sull'immagine sfondo** — l'immagine partiva con una transizione attiva, causando un fade-in di 700ms visibile.

2. **`decoding="async"` su immagini con `fetchPriority="high"`** — `decoding="async"` sposta il decode dell'immagine in un thread separato. Per immagini hero preloaded con alta priorità, questo crea un frame in cui l'immagine è stata fetchata ma non ancora decodata, causando il flash di sfondo bianco/pattern-senza-immagine.

3. **`siti-reveal-anim` con `scale(1.02)` + `blur(4px)`** — nell'editor preview, l'animazione di reveal delle immagini era vistosa e costosa (scala + blur attivano compositing GPU).

### Fix implementata

**`Hero.tsx`** — rimossi tutti i `transition-all duration-700` e `transition-all duration-500` dalle immagini hero, overlay, pattern e sezioni.

**`components/shared/SitiImage.tsx`:**
```diff
+ const isEager = loading === 'eager' || props.fetchPriority === 'high';
  return (
    <img
      loading={loading || "lazy"}
-     decoding="async"
+     decoding={isEager ? "sync" : "async"}
      ...
    />
  );
```

**`app/globals.css`** — `siti-reveal-anim` semplificata:
```diff
  @keyframes siti-reveal-anim {
-   from { opacity: 0; transform: scale(1.02); filter: blur(4px); }
-   to { opacity: 1; transform: scale(1); filter: blur(0); }
+   from { opacity: 0; }
+   to { opacity: 1; }
  }

  .siti-img-reveal {
-   animation: siti-reveal-anim 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
+   animation: siti-reveal-anim 0.4s ease-out forwards;
  }
```

### Perché è meglio

- `decoding="sync"` garantisce che l'immagine preloaded venga decodata prima della prima paint, eliminando il frame di "immagine non ancora visibile"
- Rimuovere `scale` + `blur` dall'animazione elimina layout thrash e composite layer extra — era l'effetto visivo sgradevole che descrivevi
- La transizione da 1s è sostituita da 0.4s, molto più snella

---

## Analisi: cosa blocca il caricamento in LIVE (Investigation Summary)

### Elementi non bloccanti (già ottimizzati)

| Elemento | Stato |
|---|---|
| Font Google con `display=swap` | ✅ Corretto |
| `<link rel="preconnect">` per fonts.googleapis/gstatic | ✅ Presente |
| Preload immagine hero (`<link rel="preload" as="image">`) | ✅ Presente |
| `loading="eager"` + `fetchPriority="high"` su immagini hero | ✅ Corretto |
| JSON-LD structured data | ✅ Presente |
| Canonical + hreflang | ✅ Presente |

### Elementi non critici ma da monitorare

| Elemento | Nota |
|---|---|
| Script inline Navigation (100+ righe) | Non-blocking perché inline al bottom del componente nav, ma ha un scroll listener senza throttle. Accettabile per ora. |
| `hover-lift` in `generate-static.tsx` usa `transition: all 0.5s` | Solo per floating CTA e elementi con hover esplicito, non critico. |

### Raccomandazioni future

1. **Aggiungere throttle allo scroll listener nav** (`requestAnimationFrame` o `passive: true`) per prevenire scroll jank su pagine lunghe.
2. **Aggiungere `@media (prefers-reduced-motion: reduce)`** per disabilitare tutte le animazioni per utenti con questa preferenza — attualmente assente dal codebase.
3. **Aggiungere `<link rel="preload" as="font">` per il font principale** — il preconnect è presente ma non il preload del file `.woff2` specifico.
4. **Considerare `fetchpriority="low"` per le immagini dei blocchi below-fold** invece del default `auto`.

---

## Riepilogo File Modificati

```
lib/generate-static.tsx          — blockWrapper senza transition, script animazioni above-fold
components/blocks/visual/Hero.tsx               — rimossi tutti i transition-all
components/blocks/visual/TextBlock.tsx          — rimossi transition-all
components/blocks/visual/FaqBlock.tsx           — rimossi transition-all
components/blocks/visual/CardsBlock.tsx         — rimossi transition-all
components/blocks/visual/Benefits.tsx           — rimossi transition-all
components/blocks/visual/HowItWorks.tsx         — rimossi transition-all
components/blocks/visual/PricingBlock.tsx       — rimossi transition-all
components/blocks/visual/ContactBlock.tsx       — transition-all → transition-[filter] su mappa
components/blocks/visual/SingleImage.tsx        — rimosso transition-all
components/blocks/visual/GalleryBlock.tsx       — transition-all → transition-[transform,box-shadow] su hover
components/blocks/visual/ImageTextBlock.tsx     — rimossi transition-all
components/blocks/visual/DividerBlock.tsx       — rimosso transition-all
components/blocks/visual/EmbedBlock.tsx         — rimossi transition-all
components/blocks/visual/PdfBlock.tsx           — rimosso transition-all
components/shared/SitiImage.tsx                 — decoding=sync per immagini eager/high-priority
app/globals.css                                 — siti-reveal-anim: rimossi scale+blur, durata 0.4s
```
