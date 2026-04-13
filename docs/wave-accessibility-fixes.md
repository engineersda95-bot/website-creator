# Fix Accessibilita WAVE

Lista dei fix necessari per migliorare lo score WAVE sui siti generati.

---

## Critici (impatto alto)

### 1. Skip-to-content link mancante
- **File:** `lib/generate-static.tsx`, `lib/generate-blog-static.tsx`
- **Problema:** Non esiste un link per saltare al contenuto principale. WAVE lo segnala sempre come errore.
- **Fix:** Aggiungere prima di `<main>` e aggiungere `id="main-content"` su `<main>`:
```html
<a href="#main-content" class="sr-only focus:not-sr-only absolute -top-full left-0 z-50 px-6 py-2 bg-black text-white">
  Salta al contenuto principale
</a>
<main id="main-content">
```
- **CSS necessario:** Aggiungere in `<style>`:
```css
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.sr-only:focus { position: static; width: auto; height: auto; padding: 0.5rem 1.5rem; margin: 0; overflow: visible; clip: auto; white-space: normal; }
```

### 2. Hamburger button senza `aria-expanded`
- **File:** `components/blocks/visual/navigation/Navigation.tsx` (~riga 300)
- **Problema:** Il bottone hamburger ha `aria-label="Apri menu"` ma manca `aria-expanded` per indicare lo stato del menu.
- **Fix:** Aggiungere `aria-expanded="false"` al bottone. Lo script JS in `generate-static.tsx` deve aggiornarlo a `"true"` quando il menu si apre:
```js
b.setAttribute('aria-expanded', s);
```

### 3. Menu mobile senza `role` e `aria-hidden`
- **File:** `components/blocks/visual/navigation/Navigation.tsx` (~riga 313)
- **Problema:** Il `<div data-menu>` non ha landmark role ne indicazione di visibilita per screen reader.
- **Fix:** Aggiungere al div:
```html
<div data-menu role="navigation" aria-label="Menu mobile" aria-hidden="true">
```
- Lo script JS deve aggiornare `aria-hidden` insieme a `data-open`:
```js
m.setAttribute('aria-hidden', !s);
```

---

## Medi

### 4. Link social icon-only con aria-label generico
- **File:** `components/blocks/visual/navigation/Navigation.tsx` (~righe 260, 363), `components/blocks/visual/FooterBlock.tsx` (~righe 172, 264)
- **Problema:** L'aria-label e solo il nome piattaforma (es. `"facebook"`), poco descrittivo.
- **Fix:** Cambiare in:
```jsx
aria-label={`Seguici su ${social.platform}`}
```

### 5. Hero background image senza `role="presentation"`
- **File:** `components/blocks/visual/Hero.tsx` (~riga 54, componente HeroBg)
- **Problema:** Quando `backgroundAlt` e vuoto, l'immagine e decorativa ma non e marcata come tale.
- **Fix:** Aggiungere al `<SitiImage>`:
```jsx
role={content.backgroundAlt ? 'img' : 'presentation'}
```

### 6. Link vuoti nel footer
- **File:** `components/blocks/visual/FooterBlock.tsx` (~riga 196)
- **Problema:** Se `link.label` e vuoto, viene generato un `<a>` senza testo visibile.
- **Fix:** Aggiungere guard:
```jsx
{links.filter(link => link.label?.trim()).map((link, i) => (
  ...
))}
```

### 7. Blog static HTML — stessi problemi del generatore principale
- **File:** `lib/generate-blog-static.tsx`
- **Problema:** Le pagine blog listing e blog post non hanno skip link ne `id="main-content"`.
- **Fix:** Applicare lo stesso fix del punto 1 a `generateBlogListingHtml()` e `generateBlogPostHtml()`.

---

## Minori

### 8. Heading potenzialmente vuoti nell'Hero
- **File:** `components/blocks/visual/Hero.tsx` (~riga 187, componente HeroText)
- **Problema:** Il titolo viene renderizzato anche se `content.title` e vuoto, generando un heading vuoto.
- **Fix:** Wrappare in condizionale:
```jsx
{content.title?.trim() && (
  <div dangerouslySetInnerHTML={{ __html: formatRichText(content.title) }} />
)}
```

### 9. Iframe mappa con title generico
- **File:** `components/blocks/visual/ContactBlock.tsx` (~riga 316)
- **Problema:** Il title e fisso `"Mappa di Google"` invece di essere descrittivo.
- **Fix:**
```jsx
title={content.address ? `Mappa di ${content.address}` : 'Mappa di Google'}
```

---

## Riepilogo

| # | Fix | Severita | File |
|---|-----|----------|------|
| 1 | Skip-to-content link | Critico | generate-static.tsx, generate-blog-static.tsx |
| 2 | aria-expanded hamburger | Critico | Navigation.tsx |
| 3 | role/aria-hidden menu mobile | Critico | Navigation.tsx |
| 4 | aria-label social links | Medio | Navigation.tsx, FooterBlock.tsx |
| 5 | role="presentation" hero bg | Medio | Hero.tsx |
| 6 | Link vuoti footer | Medio | FooterBlock.tsx |
| 7 | Blog HTML skip link | Medio | generate-blog-static.tsx |
| 8 | Heading vuoti hero | Minore | Hero.tsx |
| 9 | Title iframe mappa | Minore | ContactBlock.tsx |

**Totale: 9 fix in 6 file.**
