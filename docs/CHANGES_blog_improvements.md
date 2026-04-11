# Blog Improvements — Stato attuale

> Questo file documenta le funzionalità implementate e lo stato corrente del sistema blog.
> Le istruzioni operative (migration, dipendenze) sono in fondo.

---

## Funzionalità implementate

### Editor articolo (`BlogPostEditorClient.tsx`)

**Toolbar TipTap**
- Bold, Italic, Underline, H2, H3, H4, Lista puntata, Lista numerata, Citazione, Link, Codice, Separatore
- Upload immagine inline: bottone → file picker → `uploadImage` → `editor.commands.setImage`
- Sidebar contestuale su immagine selezionata: griglia aspect ratio + toggle allineamento (sx/centro/dx)
- Allineamento testo (L/C/R/Justify) applicato al paragrafo/heading selezionato
- Colore testo: color picker + bottone "rimuovi colore"
- Dettatura vocale: bottone Mic → Web Speech API → testo inserito nel cursore al completamento della frase; placeholder "🎙 Sto ascoltando..." nell'editor quando attivo; spazio pre-parola aggiunto solo se necessario

**Sidebar — 3 tab**

1. **Dettagli**: copertina (ImageUpload), excerpt, slug, categorie, autori, lingua, TOC (spostato in Stile)
2. **SEO**: titolo, descrizione, immagine OG, toggle indicizzabile, preview Google
3. **Stile articoli** (impostazioni a livello progetto, si applicano a tutti gli articoli):
   - Copertina: Tutta larghezza / Contenuta
   - Larghezza max corpo (px)
   - Padding verticale desktop + mobile (`SimpleSlider`)
   - Padding laterale desktop + mobile (`SimpleSlider`)
   - Indice dei contenuti (TOC automatico)
   - Bottone "Salva impostazioni articoli" → salva su `project.settings.blogPostDisplay`

**Header**
- Bottone stato: "Pubblica" / "Metti in bozza" → salva immediatamente solo `{status, published_at}` su Supabase, con confirm dialog prima dell'azione
- Slug: segue il titolo automaticamente finché l'articolo non viene pubblicato per la prima volta; in caso di slug già esistente, toast di errore (unique constraint DB)
- Bottone Salva: salva tutte le altre modifiche (content, seo, blocks)
- Guard uscita: `beforeunload` per refresh + intercept navigazione client-side con confirm dialog (`@/components/shared/ConfirmDialog`)

**Preview articolo**
- Overlay full-screen con viewport switcher Desktop/Tablet/Mobile (icone Monitor/Tablet/Smartphone, centrato nell'header)
- Tipografia responsive: le CSS variables (`--global-h1-fs` ecc.) vengono calcolate direttamente in base al viewport selezionato (media query non funzionano su div, quindi si fa override inline)
- Sfondo bianco esteso per tutta l'altezza (`min-height: 100vh`) sul div viewport
- Immagini: resolve `/assets/` → URL Supabase pubblici; allineamento inline immagini via flex

---

### Impostazioni stile articoli (`project.settings.blogPostDisplay`)

Le impostazioni sono a livello di **progetto** (non per singolo articolo) e si applicano a tutti gli articoli. Salvate in `project.settings` JSONB — nessuna migration necessaria.

```typescript
blogPostDisplay?: {
  coverImageMode?: 'hero' | 'contained';   // default 'hero'
  bodyMaxWidth?: number;                    // default: nessun limite (100%)
  bodyPaddingX?: number;                   // default 24px
  bodyPaddingXMobile?: number;             // default 16px
  bodyPaddingY?: number;                   // default 80px
  bodyPaddingYMobile?: number;             // default 48px
  showToc?: boolean;                       // default false
}
```

Il campo `display_settings` su `blog_posts` è ora obsoleto (non più letto né scritto). Può essere rimosso con una migration futura.

---

### Generazione statica (`generate-blog-static.tsx`)

- Legge `project.settings.blogPostDisplay` (non più `post.display_settings`)
- `bodyPaddingY` / `bodyPaddingYMobile` applicati come `padding-top/bottom` sull'`<article>`
- Media query `@media (max-width: 768px)` per padding mobile
- CSS variables tipografia (`--global-h1-fs` ecc.) con override responsive da `settings.responsive.*`
- Supporto H4 con `--global-h4-fs`
- Immagini inline: `[data-inline-image-wrap]` con `display:flex` e `justify-content` per allineamento
- TOC: `injectHeadingIds()` + `extractTocItems()` → `<nav class="blog-toc">` se `showToc === true`
- Cover hero (full-width) o contained (con border-radius, dentro l'article)

---

### Blocco BlogList (`BlogListBlock.tsx` / `BlogListUnified.tsx`)

- Rimosse: selezione manuale articoli, filtro autore, controlli colore/forma filtri (semplificate)
- Tipografia: tutti i controlli in sezione "Tipografia" sotto "Stile della Sezione" (usando `TypographyFields` standard): titolo, sottotitolo, titolo card, autore, data, filtri categoria
- Categoria sulla card segue `style.filterFontSize`
- `maxPosts`: slider senza unità px, default 6 (pagine), default 100 (pagina /blog)
- Spacing dinamico: se non c'è sottotitolo o filtri, la distanza si comprime
- Allineamento default: `left`
- CTA "Vedi tutti": sezione dedicata con `CTAManager` (solo su pagine non-/blog)
- Author display: `a.name` correttamente (non `[object Object]`)

---

### SEO Score articoli

Score grezzo nella sidebar (tab Dettagli o SEO), controlla:
- Titolo SEO: lunghezza ottimale 30-60 caratteri
- Descrizione SEO: lunghezza ottimale 120-160 caratteri
- Immagine OG: presente o assente

Non analizza il contenuto del corpo, keyword density, leggibilità ecc.

---

## Azioni manuali richieste

### Dipendenza npm
```bash
pnpm add @tiptap/extension-image
```

### Migration opzionale (pulizia)
La colonna `display_settings` su `blog_posts` non è più usata. Può essere rimossa:
```sql
ALTER TABLE blog_posts DROP COLUMN IF EXISTS display_settings;
```
Non urgente — nessun effetto funzionale se lasciata.

---

## Punti aperti

- **Dettatura vocale**: le parole appaiono al completamento della frase (comportamento Web Speech API). Non c'è streaming in tempo reale nell'editor (interim results scartati per evitare duplicati).
- **SEO score**: molto grezzo, non analizza contenuto body.
- **Cleanup storage**: cover image di articoli eliminati possono diventare orfane (edge function `cleanup-storage` non scansiona `blog_posts`).
- **Normalizzazione categorie**: `"Tech"` e `"tech"` sono distinte nel DB; il filtro listing usa `.toLowerCase()` ma l'editor non normalizza.
- **Slug autori**: campo `slug` in `authors[]` non generato né usato; necessario solo per future pagine autore.
