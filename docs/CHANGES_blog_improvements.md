# Blog Improvements — Changelog e istruzioni operative

## Azioni manuali richieste PRIMA di andare in produzione

### 1. Eseguire la migration Supabase

File: `supabase/migration_blog_display_settings.sql`

```sql
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS display_settings JSONB DEFAULT '{}'::jsonb;
```

Eseguire nel SQL Editor di Supabase (o via CLI `supabase db push`).  
Questa colonna è necessaria per: TOC, stile articolo (cover mode, larghezza corpo, padding, allineamento).  
Senza migration i campi vengono ignorati silenziosamente — nessun errore, ma le impostazioni non vengono salvate.

### 2. Installare la dipendenza npm

```bash
pnpm add @tiptap/extension-image
```

Già eseguito nella sessione corrente, ma verificare che sia nel `package.json` prima di deployare su CI/CD.

---

## Modifiche apportate

### `types/editor.ts`
- Aggiunto campo opzionale `display_settings` a `BlogPost`:
  ```typescript
  display_settings?: {
    showToc?: boolean;
    coverImageMode?: 'hero' | 'contained';
    bodyMaxWidth?: number;      // opzionale — assente = 100% larghezza
    bodyPaddingX?: number;      // default 24px
    bodyAlign?: 'left' | 'center' | 'right'; // default 'left'
  }
  ```

### `supabase/migration_blog_display_settings.sql` *(nuovo)*
- Aggiunge la colonna `display_settings JSONB` alla tabella `blog_posts`.

### `lib/generate-blog-static.tsx`
- Rimossi gli "Articoli correlati" (erano pre-esistenti, non richiesti, complicavano la preview).
- Rimosso parametro `allPosts` dalla firma — non più necessario.
- Aggiunto parametro `isStatic: boolean = true` — `false` usa URL Supabase pubblici (preview), `true` usa `/assets/...` (deploy).
- Aggiunto supporto H4: CSS `h4 { ... }` e variabile `--global-h4-fs`.
- Aggiunto supporto immagini inline: CSS per `[data-inline-image-wrap]`, `[data-align]`, `[data-inline-image]`.
- Aggiunto TOC: funzioni `injectHeadingIds()` e `extractTocItems()`, CSS per `.blog-toc`, rendering condizionale se `display_settings.showToc === true`.
- Aggiunto supporto `display_settings`: cover hero/contained, `max-width`/`padding`/`margin` dinamici sull'articolo.
- Aggiornato chiamante in `app/actions/deploy.ts` (rimosso argomento `allPosts`).

### `app/actions/blog-preview.ts` *(nuovo)*
- Server action `previewBlogPostHtml(post, project, siteGlobals)`.
- Non fa fetch al DB — riceve tutto dall'editor già in memoria.
- Chiama `generateBlogPostHtml` con `isStatic=false` per avere URL immagini reali nell'iframe.

### `app/editor/[projectId]/blog/[postId]/BlogPostEditorClient.tsx`
- **H4**: aggiunto pulsante toolbar `H4`.
- **Immagini inline**: pulsante toolbar con upload file → `uploadImage` → `editor.commands.setImage`; sidebar contestuale su nodo immagine selezionato con griglia aspect ratio e toggle allineamento.
- **TOC**: toggle `showToc` nella tab "Dettagli" sidebar, salvato in `display_settings`.
- **Preview live**: bottone "Anteprima" nell'header → chiama `previewBlogPostHtml` → overlay full-screen con `<iframe srcDoc>`. I `siteGlobals` sono fetchati una volta al mount.
- **Stile articolo**: nuova tab "Stile" nella sidebar con: cover mode (hero/contained), slider larghezza corpo, padding laterale, margine verticale, allineamento.
- **Status auto-save**: il pulsante Pubblica/Bozza salva immediatamente solo `{status, published_at}` su Supabase, con update ottimistico e rollback su errore. Non richiede click su Salva.
- `handleSave` ora include `display_settings` nel payload.

### `components/blocks/sidebar/block-editors/BlogListUnified.tsx`
- Rimossa modalità `manual` (selezione articoli a mano).
- Fetch ridotto a sola colonna `categories`.
- Aggiunto `TypographyFields` condizionale sotto i toggle `showAuthor` / `showDate`.
- Aggiunto controlli stile filtri nella sezione "Impostazioni": `filterFontSize`, `filterBorderRadius`, `filterPaddingX`, `filterPaddingY` + colori attivo/inattivo già presenti.
- Nuova sezione "CTA" (nascosta sulla pagina /blog) con toggle `showViewAll` + `CTAManager` su chiavi `viewAllCta / viewAllCtaUrl / viewAllCtaTheme`.

### `components/blocks/visual/BlogListBlock.tsx`
- Rimosso branch `filterMode === 'manual'`.
- Filtri categoria: `filterPillStyle` inline (font size, border radius, padding) — rimosse classi Tailwind hardcoded.
- Autore/data: stili dinamici da `style.authorSize/Bold/Italic` e `style.dateSize/Bold/Italic`.
- CTA "Vedi tutti": sostituito vecchio `<a>` hardcoded con componente `<CTA>` standard (`getButtonStyle`, temi, overrides custom). Posizionato in alto a destra della riga titolo (`flex items-start justify-between`).
- Rimosso blocco CTA in fondo alla sezione.

### `components/blocks/visual/BlogListBlock.definition.tsx`
- Rimosso `manualPostIds: []` dai defaults.

---

## Checklist di test

### Articolo — Editor

- [ ] **H4**: inserire un H4 nell'editor → verificare che sia formattato diversamente da H3 nel canvas preview e dopo deploy.
- [ ] **Immagini inline**: caricare un'immagine nel corpo → apparire nel corpo del testo; cambiare aspect ratio (16/9, 1/1, ecc.) → proporzioni rispettate; cambiare allineamento (sx/centro/dx) → rispettato nell'editor e nel deploy.
- [ ] **TOC**: scrivere almeno 3 heading H2/H3 → attivare "Mostra indice" nella sidebar → verificare che la preview mostri il TOC cliccabile sopra il corpo; i link devono saltare all'heading corretto.
- [ ] **Preview live**: click "Anteprima" → overlay si apre con nav + footer + articolo completo; le immagini (cover e inline) sono visibili; chiudere con ✕.
- [ ] **Stile articolo**:
  - Cover mode "Contenuta" → cover non a tutta larghezza, con border-radius; "Tutta larghezza" → cover full-width.
  - Slider larghezza corpo → corpo si restringe/allarga nel deploy.
  - Padding laterale e margine verticale → rispettati.
  - Allineamento → testo allineato correttamente.
- [ ] **Status auto-save**: click "Pubblica" senza salvare altre modifiche → articolo risulta pubblicato nel DB (verificare su Supabase o nella lista articoli); click "Bozza" → torna a draft, `published_at` diventa null; la data di pubblicazione originale viene mantenuta se si ri-pubblica.
- [ ] **Salva**: modificare titolo + display_settings → Salva → ricaricare la pagina → modifiche persistite.

### BlogList — Editor e Deploy

- [ ] **Nessuna selezione manuale**: aprire sidebar BlogList → non deve esserci l'opzione "Manuale" nel selettore filtro.
- [ ] **Filtro categoria**: selezionare "Categoria" → scegliere una categoria → solo gli articoli di quella categoria vengono mostrati.
- [ ] **Stile filtri**: cambiare font size, border radius, padding X/Y dei filtri → riflessi immediatamente nel canvas; dopo deploy i filtri statici hanno lo stesso stile.
- [ ] **Tipografia autore**: attivare "Mostra autore" → cambiare font size / bold / italic → applicato nelle card.
- [ ] **Tipografia data**: stesso test per la data.
- [ ] **CTA "Vedi tutti"**: configurare label, URL, tema dalla sezione CTA → appare in alto a destra rispetto al titolo; disattivare il toggle → CTA scompare; sulla pagina /blog la sezione CTA non deve essere visibile nella sidebar.
- [ ] **Deploy**: eseguire un deploy completo → verificare che la pagina blog e le pagine articolo funzionino correttamente; nessun errore sulla rimozione degli articoli correlati.
