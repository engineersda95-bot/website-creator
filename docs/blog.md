# Blog — Sistema articoli, editor e generazione statica

> Come funziona il sistema blog: dalla creazione di un articolo nell'editor al sito pubblicato.

---

## Panoramica architettura

```
ProjectDashboardClient (tab Blog)
  ├── Crea articolo → blog_posts INSERT → redirect editor
  ├── Lista articoli con filtro lingua
  ├── Card: apri editor, traduci (TranslateBlogPostModal), elimina
  └── Controlla canCreateArticle() prima della creazione

BlogPostEditorClient (editor singolo articolo)
  ├── Titolo, Excerpt, Cover image (ImageUpload in sidebar → useEditorStore.uploadImage → WebP)
  ├── Body: TipTap WYSIWYG (HTML salvato in blocks[0].content.text)
  ├── Toolbar: Bold/Italic/H2/H3/H4/Lista/Citazione/Link/Codice/Separatore/ImmagineInline/AllineamentoTesto/ColoreTesto/Voce
  ├── Sidebar 3 tab: Dettagli (slug, categorie, autori, lingua) | SEO | Stile articoli (project-level)
  └── Header: Pubblica/Bozza (auto-save), Salva, Elimina, switch lingua, Anteprima (overlay con viewport switcher)

Deploy (app/actions/deploy.ts)
  ├── generateBlogListingHtml()  → /blog/index.html (per lingua)
  └── generateBlogPostHtml()     → /blog/{slug}/index.html (per articolo)
```

---

## Database — blog_posts

Tabella creata da `supabase/migration_blog.sql` (eseguire dopo `permissions_system.sql`).

| Colonna | Tipo | Note |
|---|---|---|
| id | UUID PK | `uuid_generate_v4()` |
| project_id | UUID FK → projects | CASCADE delete |
| slug | TEXT | Unico per `(project_id, slug, language)` |
| title | TEXT | |
| excerpt | TEXT | Massimo 2-3 frasi, usato in listing e OG |
| cover_image | TEXT | Path asset `/assets/{filename}` |
| categories | JSONB | `string[]` |
| authors | JSONB | `{ name, slug, bio?, avatar? }[]` |
| status | TEXT | `'draft'` o `'published'` |
| published_at | TIMESTAMPTZ | Impostato al momento della pubblicazione |
| blocks | JSONB | `Block[]` — nella pratica un solo blocco `type:'text'` con `content.text` in **HTML** (ex markdown, vedi sotto) |
| seo | JSONB | `{ title?, description?, image?, indexable? }` |
| display_settings | JSONB | **Obsoleto** — non più letto/scritto. Le impostazioni stile sono ora in `project.settings.blogPostDisplay`. |
| language | TEXT | Codice ISO breve: `'it'`, `'en'`, `'fr'` ... |
| translation_group | UUID | Collega articoli che sono traduzioni dello stesso contenuto |
| created_at / updated_at | TIMESTAMPTZ | `updated_at` aggiornato da trigger |

**Indici:**
- `(project_id, language)` — filtro listing per lingua nel deploy
- `(translation_group)` — find siblings per lo switch lingua nell'editor
- `(project_id, published_at DESC) WHERE status = 'published'` — ordinamento listing

**RLS:** utenti accedono solo agli articoli dei propri progetti.

### Formato `blocks[0].content.text` — HTML vs Markdown

L'editor usa **TipTap** e salva HTML (`<p>`, `<h2>`, `<ul>`, ecc.) dal momento in cui viene aperto con la nuova versione.

Articoli creati prima della migrazione a TipTap hanno il corpo in **Markdown grezzo**. `BlogPostEditorClient` rileva il formato al caricamento:
```typescript
const isHtml = rawBody.trim().startsWith('<');
const initialHtml = isHtml ? rawBody : marked.parse(rawBody, { breaks: true });
```
Alla prima modifica e salvataggio, il contenuto viene riscritto in HTML. Idem in `generate-blog-static.tsx`:
```typescript
const isMarkdown = !/<[a-z][\s\S]*>/i.test(text.trim().slice(0, 50));
const rendered = isMarkdown ? marked.parse(text, { breaks: true }) : text;
```
Entrambi i formati sono quindi supportati in modo trasparente — non serve migrazione DB.

---

## Editor articolo

File: `app/editor/[projectId]/blog/[postId]/BlogPostEditorClient.tsx`

### TipTap WYSIWYG

L'editor usa TipTap v3 (`@tiptap/react`) con le estensioni:
- `StarterKit` — heading (H2/H3/H4), bold, italic, lists, blockquote, hr, code, history (⌘Z/⌘Y)
- `Underline`
- `TipTapLink` — link inseribili via prompt, non cliccabili durante l'editing
- `Placeholder`
- `TextAlign` — allineamento L/C/R/Justify per paragrafo/heading
- `TextStyle` + `Color` — colore testo inline
- `InlineImage` (custom su `@tiptap/extension-image`) — immagini nel corpo con attributi `aspectRatio` e `align`; sidebar contestuale per modificarli

Il contenuto viene sincronizzato con `post.blocks` tramite `onUpdate`.

### Dettatura vocale

Il bottone **Voce** nella toolbar attiva la Web Speech Recognition API:
- Il testo viene inserito nel cursore al completamento di ogni frase (`isFinal`); spazio pre-parola aggiunto solo se il carattere precedente non è già uno spazio
- Placeholder "🎙 Sto ascoltando..." nell'editor quando attivo (solo se editor vuoto)
- `shouldRecordRef` traccia lo stato: se il browser interrompe per silenzio/errori transitori, riparte automaticamente
- Errori `network` silenziosi — ripartenza automatica
- Errore `not-allowed` → toast con istruzioni
- Supportato solo su Chrome/Edge (Web Speech API)

### Anteprima articolo

Overlay full-screen attivabile dal bottone "Anteprima" nell'header:
- Viewport switcher Desktop/Tablet/Mobile centrato nell'header (icone Monitor/Tablet/Smartphone)
- Tipografia responsive: le CSS variables (`--global-h1-fs` ecc.) sono calcolate direttamente in base al viewport selezionato (le media query non funzionano su div — override inline)
- Immagini: `/assets/` risolti in URL Supabase pubblici
- Cover hero o contained, TOC, body con padding da `project.settings.blogPostDisplay`

### Stile articoli (project-level)

Le impostazioni di presentazione degli articoli sono in `project.settings.blogPostDisplay` (JSONB già esistente — nessuna migration). Si configurano dal tab "Stile" nell'editor articolo e si applicano a **tutti gli articoli del progetto**:

| Campo | Default | Descrizione |
|-------|---------|-------------|
| `coverImageMode` | `'hero'` | `'hero'` = full-width, `'contained'` = dentro l'article con border-radius |
| `bodyMaxWidth` | nessun limite | Larghezza max corpo in px |
| `bodyPaddingX` | 24 | Padding laterale desktop (px) |
| `bodyPaddingXMobile` | 16 | Padding laterale mobile (px) |
| `bodyPaddingY` | 80 | Padding verticale desktop (px) |
| `bodyPaddingYMobile` | 48 | Padding verticale mobile (px) |
| `showToc` | false | Mostra TOC automatico dagli heading |

### SEO Score

Nella sidebar tab SEO è presente uno score grezzo che verifica:
- Titolo SEO: lunghezza ottimale 30–60 caratteri
- Descrizione SEO: lunghezza ottimale 120–160 caratteri  
- Immagine OG: presente/assente

Non analizza contenuto del corpo, keyword density o leggibilità.

### Gestione traduzioni

La traduzione si avvia dalla **card** nella lista articoli del progetto, non dall'editor. Il componente è `TranslateBlogPostModal`:
- Selettore lingua target (solo lingue non ancora tradotte)
- Campi titolo e slug pre-compilati, modificabili
- Controlla articoli esistenti con stesso `translation_group` — se la lingua è già coperta, quella opzione non appare
- Crea un articolo vuoto (bozza) nella lingua target, collega `translation_group`
- Se l'articolo sorgente non aveva `translation_group`, lo riceve (viene usato `post.id` come group ID)

La traduzione AI (`translateBlogPostWithAI()`) esiste ma è nascosta nell'UI — da attivare dopo test quota.

I codici lingua sono normalizzati alla forma breve (`'en-gb'` → `'en'`) prima di qualsiasi confronto o visualizzazione.

### Categorie e autori

Gestiti come array JSONB. Nell'editor:
- Input con `<datalist>` che suggerisce valori già usati negli altri articoli del progetto (fetch all'apertura)
- Aggiunta con tasto Invio, rimozione con la `×` sul tag
- Non esiste una tabella dedicata: i valori sono estratti dai documenti esistenti ad ogni apertura dell'editor

**Considerazioni di performance:**
- La query di popolamento suggerimenti (`SELECT authors, categories FROM blog_posts WHERE project_id = ?`) scala linearmente col numero di articoli. Per progetti con centinaia di articoli potrebbe diventare lenta.
- Soluzione futura: una tabella `blog_taxonomies(project_id, type, value)` aggiornata da trigger su `blog_posts` INSERT/UPDATE, oppure una colonna `jsonb_agg` materializzata per progetto.
- Per ora la query porta solo `authors` e `categories` (no `blocks`), quindi il payload rimane contenuto anche con molti articoli.

**Considerazioni sul formato:**
- `authors` è `string[]` nell'UI ma `{ name, slug, bio?, avatar? }[]` nello schema JSONB — nel codice attuale viene usato solo come array di stringhe (nomi). Il campo `slug` è previsto per le future pagine autore ma non viene né generato né validato automaticamente.
- `categories` è `string[]` senza normalizzazione: `"Tech"` e `"tech"` sono due categorie diverse. Il filtro nel listing statico usa `.toLowerCase()` per il confronto, ma nell'editor e nel DB rimangono distinte.

### Upload cover image

Usa il componente `ImageUpload` nel sidebar (sezione Dettagli), come tutti i moduli dell'editor. `onChange(base64)` chiama `useEditorStore.uploadImage(base64)` che:
1. Converte in WebP via `optimizeImageToWebP` (max 2400px, qualità progressiva ≤1.8MB)
2. Genera il nome con hash SHA-256: `img_{hash}.webp`
3. Fa upsert su Supabase Storage: `{userId}/{projectId}/img_{hash}.webp`
4. Ritorna `/assets/img_{hash}.webp` salvato in `cover_image`

Nel sito statico `resolveImageUrl(path, project, {}, true)` restituisce il path relativo CDN. Lo store deve avere il progetto inizializzato (`setProject(initialProject)` all'mount).

---

## Generazione statica (deploy)

File: `lib/generate-blog-static.tsx`

Chiamata da `app/actions/deploy.ts` dopo la generazione delle pagine normali.

### generateBlogListingHtml(posts, allPages, project, langPrefix)

Genera `/blog/index.html` (o `/{lang}/blog/index.html` per siti multilingua).

Caratteristiche:
- Mostra solo articoli `status = 'published'`, ordinati per `published_at DESC`
- Filtro categorie via vanilla JS (click → toggler CSS class)
- Ricerca testo client-side su titolo/autore
- Ogni card ha `data-category`, `data-authors`, `data-title` per il filtro
- Cover image con `loading="lazy"` e placeholder SVG se assente
- Rispetta colori tema (`primaryColor`, `themeColors`), font (`fontFamily`)

### generateBlogPostHtml(post, allPages, project, langPrefix, siteGlobals, isStatic)

Genera `/blog/{slug}/index.html` per ogni articolo pubblicato.

Caratteristiche:
- Il body (`blocks[0].content.text`) viene usato direttamente se è HTML; altrimenti convertito da Markdown via `marked` (backward compat)
- Inietta nav e footer da `siteGlobals` (stesso meccanismo delle pagine normali)
- Hreflang `<link>` per le traduzioni (se `translation_group` presente)
- SEO: `<title>`, `<meta description>`, Open Graph, `<link rel="canonical">`
- Schema.org `Article` strutturato
- Breadcrumb (Home → Blog → Titolo)
- Legge `project.settings.blogPostDisplay` per cover mode, padding, max-width
- `isStatic=false` usa URL Supabase pubblici per le immagini (usato nella preview editor)

### Nav e Footer nelle pagine statiche

Tutte e tre le funzioni accettano `siteGlobals: SiteGlobal[]` e usano `renderBlock` (esportata da `generate-static.tsx`) per iniettare nav e footer nella lingua corretta — stesso meccanismo delle pagine normali. Il CSS `* { margin:0; padding:0 }` è stato rimosso e sostituito con selettori scoped (`.blog-page`, `article`) per evitare che la reset globale rompa il layout hamburger della nav.

Le pagine autore (`generateBlogAuthorPages`) sono state rimosse dal deploy (nessuno le aveva richieste).

---

## Blocco blog-list nell'editor pagine

File: `components/blocks/visual/BlogListBlock.tsx`

Quando si aggiunge un blocco `blog-list` a una pagina normale, questo mostra gli articoli del progetto inline nel canvas. `EditorBlockWrapper` inietta la prop `allBlogPosts` con gli articoli correnti da Supabase.

La lingua del blocco è iniettata automaticamente da `effectiveBlock` in `EditorBlockWrapper`, così il blocco mostra solo gli articoli nella lingua della pagina corrente.

**Stile card (allineato alle pagine statiche):**
- Categoria: `opacity: 0.5`, colore del testo — non usa il `primaryColor`
- Autore/data: `font-size: 0.9375rem`, `opacity: 0.5`, solo testo (nessun link)
- Filtro categoria attivo: sfondo `primaryColor`, testo bianco (non `currentColor` che causava testo invisibile)
- "Vedi tutti gli articoli": CTA button con `primaryColor` background, non link colorato inline

---

## Permessi e quote

`lib/permissions.ts` → `canCreateArticle(userId, projectId)`

Conta gli articoli esistenti in `blog_posts` per il progetto, confronta con `max_articles_per_project` dal piano. Stessa architettura di `canCreatePage`.

Limiti piani:
- **free:** 10 articoli per progetto
- **starter:** 50 articoli per progetto
- **pro / agency:** illimitati

---

## Punti aperti / miglioramenti futuri

### Traduzione AI (nascosta)

`translateBlogPostWithAI()` in `app/actions/ai-generator.ts` è implementata e gated con `canUseAI()` + `increment_ai_usage`. Il bottone nell'editor è commentato. Da attivare dopo verifica quota e UX.

### Paginazione listing

Vedi sezione dedicata **[Scalabilità Blog](#scalabilità-blog--paginazione-ricerca-e-deploy-incrementale)** per analisi completa.

### Generazione incrementale

Vedi sezione dedicata **[Scalabilità Blog](#scalabilità-blog--paginazione-ricerca-e-deploy-incrementale)** per analisi completa.

### SEO score articoli

Lo score attuale è grezzo (titolo, descrizione, immagine OG). Non analizza: keyword nel corpo, densità, leggibilità, heading structure. Da migliorare in futuro.

### Normalizzazione categorie

Attualmente `"Tech"` e `"tech"` sono due categorie distinte nel DB. Il filtro nel listing usa `.toLowerCase()` ma l'editor non normalizza. Se si vuole consistenza: normalizzare in lowercase al momento dell'inserimento.

### Slug autori

`authors` è usato come array di oggetti `{ name, slug, ... }`. Il campo `slug` non viene generato né usato. Necessario solo per future pagine autore dedicate (`/blog/author/{slug}/`).

### Suggerimenti categorie/autori — scalabilità

Il fetch avviene ad ogni apertura editor. Con centinaia di articoli la query resta leggera (no `blocks`), ma la soluzione definitiva è una tabella `blog_taxonomies` aggiornata da trigger.

### Cleanup storage

La edge function `cleanup-storage` non scansiona `blog_posts.cover_image`. Le cover degli articoli eliminati possono diventare orfane in Supabase Storage.

### Colonna `display_settings` obsoleta

La colonna `display_settings JSONB` su `blog_posts` non è più letta né scritta (le impostazioni sono ora in `project.settings.blogPostDisplay`). Può essere rimossa con `ALTER TABLE blog_posts DROP COLUMN display_settings` quando opportuno.

---

## Scalabilità Blog — Paginazione, Ricerca e Deploy Incrementale

> Analisi delle scelte architetturali per gestire blog con molti articoli su siti statici. Ogni opzione è valutata con pro, contro e impatto sul deploy.

> **⚠ STATO ATTUALE — NIENTE DI QUESTA SEZIONE È IMPLEMENTATO**
>
> Oggi il deploy genera un **unico file `blog/index.html`** con tutti gli articoli pubblicati in ordine cronologico, senza paginazione. Non esiste file di ricerca JSON, non esistono URL `/blog/page/N/`, non esistono listing per categoria. Questa sezione documenta l'architettura da adottare per scalabilità futura.

### Limite articoli (decisione attuale)

**Limite attuale: 1000 articoli per progetto** (hard limit nei permessi piano).

Con 20 articoli per pagina → massimo 50 pagine di listing.

---

### Struttura URL consigliata

```
/blog/page/1                     → listing principale, pagina 1 (~20 articoli)
/blog/page/2                     → pagina 2
/blog/{categoria}/page/1         → listing per categoria
/blog/{slug}                     → articolo singolo
/blog/search-index.json          → indice ricerca client-side
```

**Regole:**
- Un articolo può avere più categorie e compare in tutte le relative listing di categoria
- Click su categoria → nuova pagina `/blog/{categoria}/page/1` (non filtro JS nella stessa pagina)
- Ogni listing ha navigazione prev/next tra le pagine
- `/blog/` (senza `page/1`) fa redirect o serve direttamente la pagina 1

---

### Il Problema dello "Shift" nella Paginazione Statica

> **Nota critica (da verificare empiricamente):** ogni volta che si pubblica un nuovo articolo, esso si inserisce in cima a pagina 1. Questo sposta tutti gli articoli di una posizione: l'ultimo di pagina 1 va a pagina 2, l'ultimo di pagina 2 va a pagina 3, e così via. **Con 50 pagine, pubblicare 1 articolo richiede di rigenerare tutte e 50 le pagine di listing.**

Questo è il trade-off fondamentale della paginazione statica rispetto a quella dinamica.

#### Opzione A — Accettare la rigenerazione completa delle listing (consigliata)

Al deploy, rigenerare sempre tutte le pagine di listing principale e di categoria coinvolta.

**Pro:**
- Semplice da implementare
- Listing sempre coerenti e corrette
- Le pagine articolo (`/blog/{slug}/index.html`) non cambiano → risparmio reale

**Contro:**
- Pubblicare 1 articolo rigenera potenzialmente 50+ file HTML di listing
- Tempo aggiunto stimato: ~2-5s per 50 pagine (generazione HTML è veloce)
- Con categorie numerose (10 categorie × 5 pagine ciascuna) → 50 + 50 = 100 file di listing

**Conclusione:** il costo è basso perché generare un file HTML di listing è veloce (~50ms). Il collo di bottiglia reale è l'upload su Cloudflare Pages (sempre completo via Wrangler), non la generazione. → **Accettabile fino a ~500 articoli**.

---

#### Opzione B — Paginazione "offset fisso" (no shift)

Le pagine non usano un indice numerico (`page/1`, `page/2`) ma un cursor temporale:

```
/blog/2025/         → articoli del 2025
/blog/2024/         → articoli del 2024
/blog/2025/page/2/  → pagina 2 del 2025 (se >20 articoli quell'anno)
```

Oppure con cursor per data:
```
/blog/page/before/2025-03-15/   → articoli più vecchi di questa data
```

**Pro:**
- Nessuno shift: pubblicare un nuovo articolo non sposta quelli vecchi nelle pagine precedenti
- Deploy incrementale perfetto: solo la pagina del periodo corrente cambia

**Contro:**
- URL brutti e non intuitivi
- Navigazione prev/next più complessa
- "Pagina 1" continua a cambiare (nuovi articoli si aggiungono)
- Non standard, gli utenti si aspettano `/page/2/`

**Conclusione:** troppo complessa, benefici marginali rispetto all'Opzione A.

---

#### Opzione C — "Load more" / Infinite scroll con JSON

Non generare pagine di listing paginate. Generare un solo `/blog/index.html` con i primi 20 articoli hard-coded nell'HTML, e un file `/blog/articles.json` con tutti gli articoli. JS lato client carica altri articoli al click di "Carica altri".

**Pro:**
- Nessuno shift da gestire
- Un solo file HTML di listing (non 50)
- Deploy incrementale semplicissimo: aggiorna solo `articles.json` e `index.html`

**Contro:**
- Articoli non indicizzabili oltre i primi 20 (Google vede solo l'HTML iniziale)
- Esperienza utente peggiore rispetto alla navigazione paginata
- Richiede JS abilitato
- Non funziona bene per SEO di categoria

**Conclusione:** accettabile per blog piccoli (<50 articoli) o come soluzione temporanea. Da evitare per blog editoriali che vogliono indicizzazione completa.

---

### Ricerca Client-Side con JSON

**Approccio consigliato:** generare `/blog/search-index.json` ad ogni deploy.

```json
[
  {
    "title": "Come creare un sito web",
    "slug": "come-creare-un-sito-web",
    "excerpt": "Guida passo passo...",
    "categories": ["tutorial", "web"],
    "published_at": "2025-03-15",
    "cover_image": "/assets/img_abc123.webp"
  },
  ...
]
```

**Vantaggi:**
- File sempre piccolo: 1000 articoli × ~300 byte ≈ ~300KB (gzippato ~60KB)
- Ricerca istantanea client-side (no server, no API)
- Funziona con siti completamente statici
- Facile da aggiornare: sempre rigenerato al deploy (costo trascurabile)

**Implementazione JS:**
```javascript
// search.js nella pagina /blog/
fetch('/blog/search-index.json')
  .then(r => r.json())
  .then(articles => {
    input.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      const results = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.categories.some(c => c.toLowerCase().includes(q))
      );
      renderResults(results);
    });
  });
```

**Limitazioni:**
- Nessuna ricerca full-text nel corpo degli articoli (troppo pesante includere HTML completo)
- Per ricerca avanzata (full-text nel body): Pagefind (tool open-source che genera indice statico al build time, ~10KB di JS)

**Decisione attuale:** implementare `search-index.json` nella fase di deploy. Barra di ricerca opzionale nella pagina listing (da aggiungere come opzione nel blocco `blog-list`).

---

### Impatto sul Deploy Incrementale

La paginazione introduce nuove dipendenze nel grafo del deploy. Schema completo:

| Azione | File da rigenerare |
|--------|--------------------|
| Pubblica nuovo articolo | `/blog/{slug}/index.html` (nuovo) + tutte le pagine `/blog/page/*` + pagine categoria dell'articolo `/blog/{cat}/page/*` + `sitemap.xml` + `search-index.json` |
| Modifica articolo esistente (nessun cambio stato) | Solo `/blog/{slug}/index.html` |
| Metti in bozza (unpublish) articolo | Elimina `/blog/{slug}/index.html` + tutte le pagine listing + `sitemap.xml` + `search-index.json` |
| Modifica pagina con blocco `blog-list` | Solo quella pagina |
| Cambia template / tema sito | Tutto (listing + articoli + pagine normali) |

**Osservazione chiave:** le pagine articolo (`/blog/{slug}/`) sono stabili — cambiano solo se l'articolo viene modificato. Le pagine listing sono instabili — cambiano ad ogni pubblicazione. Questa asimmetria è il punto di leva per l'ottimizzazione.

#### Strategia incrementale raccomandata

```typescript
// Pseudo-logica deploy incrementale con paginazione
const lastPublished = project.last_published_at;

// 1. Articoli modificati → rigenerare solo quei file HTML
const changedPosts = posts.filter(p =>
  !lastPublished || new Date(p.updated_at) > new Date(lastPublished)
);

// 2. Se ci sono articoli nuovi/rimossi/modificati → rigenerare TUTTE le listing
//    (shift effect: non si può sapere quali pagine sono cambiate senza ricalcolarle tutte)
const needsFullListingRegen = changedPosts.length > 0;

// 3. Categorie coinvolte (solo le loro listing cambiano, non le altre)
const affectedCategories = [...new Set(changedPosts.flatMap(p => p.categories))];

// 4. search-index.json → sempre rigenerato se ci sono articoli cambiati
// 5. sitemap.xml → sempre rigenerata
```

**Risparmio reale con deploy incrementale:**

| Scenario | Deploy completo | Deploy incrementale |
|----------|----------------|---------------------|
| Pubblica 1 articolo (blog da 100, 5 categorie) | ~120s | ~15s (1 articolo + ~30 listing + sitemap) |
| Modifica testo articolo esistente | ~120s | ~3s (solo quell'articolo) |
| Primo deploy / tema cambiato | ~120s | ~120s (sempre completo) |

#### Il collo di bottiglia: Wrangler upload

Wrangler esegue sempre un **direct upload completo** — non ha modalità differenziale. Il comando in `app/actions/deploy.ts` è:

```bash
npx wrangler@3 pages deploy "{tempDir}" --project-name="{name}" --branch="main"
```

Carica **tutti i file della temp directory** ad ogni deploy, indipendentemente da quanti sono cambiati.

**Dove si manifesta il problema:**

| File count | Stima tempo solo upload Wrangler | Totale deploy (gen + Tailwind + upload) |
|------------|----------------------------------|----------------------------------------|
| ~20 file (5 pagine, no blog) | ~5s | ~15-30s |
| ~150 file (5 pagine + 100 articoli) | ~15-20s | ~60-90s |
| ~550 file (5 pagine + 500 articoli) | ~60-90s | ~3-5 min |
| ~1100 file (5 pagine + 1000 articoli + listing paginate) | ~150-200s | **vicino/oltre timeout Vercel (300s)** |

Il timeout di Vercel Server Actions è **300 secondi** (5 minuti). Con 1000 articoli si rischia di superarlo.

**Cosa cambia con il deploy incrementale:**
Il deploy incrementale risparmia principalmente il tempo di **generazione HTML** (che scala linearmente con gli articoli) e di **download asset da Supabase**. Ma l'upload Wrangler resta completo — anche se hai generato solo 5 file, Wrangler carica comunque tutti i ~1100 file dalla temp dir. Per ottenere un upload veramente incrementale bisogna cambiare backend di hosting (vedi [deploy-strategy.md — Opzione C R2](deploy-strategy.md) o [Opzione B VPS con rsync](deploy-strategy.md)).

**Quando attivarsi:** il problema diventa concreto intorno ai **500+ articoli** (totale file >500, upload ~60-90s). La soglia di attenzione è ~200 articoli se il sito ha anche molte pagine normali e asset pesanti.

**Documentazione di riferimento:** [docs/deploy-strategy.md](deploy-strategy.md) — sezioni 1 (problema), 2 (incrementale), 3 (limiti Cloudflare Pages), 4 (confronto architetture). La tabella dei tempi stimati totali è nella sezione 1.

---

### Considerazioni SEO per le Listing Paginate

Le pagine `/blog/page/2/`, `/blog/page/3/` ecc. devono avere:

```html
<!-- Pagina 2 della listing principale -->
<link rel="prev" href="/blog/page/1/" />
<link rel="next" href="/blog/page/3/" />
<link rel="canonical" href="/blog/page/2/" />
```

- `rel="canonical"` su `/blog/` e `/blog/page/1/` devono puntare alla stessa URL (o fare redirect 301 da `/blog/` a `/blog/page/1/`)
- Le pagine di categoria devono essere incluse in `sitemap.xml` (con priorità minore degli articoli)
- Non usare `noindex` sulle pagine paginate — Google le indica come preferenza, non obbligo

---

### Riepilogo Decisioni

| Aspetto | Scelta attuale | Note |
|---------|---------------|------|
| Struttura URL | `/blog/page/{n}/` e `/blog/{cat}/page/{n}/` | Standard, SEO-friendly |
| Articoli per pagina | 20 | Bilanciamento performance/UX |
| Limite articoli | 1000 (hard limit permessi) | Max 50 pagine di listing |
| Problema shift | Accettato (rigenera tutte le listing) | Costo basso in generazione, non in upload |
| Ricerca | `search-index.json` + JS client-side | Semplice, zero dipendenze server |
| Ricerca full-text body | Non implementata (futura: Pagefind) | |
| Deploy incrementale | Articoli stabili, listing sempre rigenerate | Approccio A |

---

## Flusso completo — dalla creazione alla pubblicazione

```
1. ProjectDashboardClient → tab Blog → "Nuovo Articolo"
   ├── canCreateArticle() check
   ├── Crea pagina /blog se non esiste
   └── INSERT blog_posts (status: 'draft') → redirect editor

2. BlogPostEditorClient
   ├── Scrive titolo, excerpt, corpo nel TipTap WYSIWYG
   ├── Upload cover image (Supabase Storage → /assets/)
   ├── Imposta categorie, autori, slug, SEO
   └── "Pubblica" → status: 'published', published_at: now()

3. ProjectDashboardClient → card articolo → "Traduci" (opzionale)
   ├── TranslateBlogPostModal: sceglie lingua, titolo, slug
   ├── Controlla che la lingua non sia già tradotta
   └── INSERT blog_posts con translation_group collegato

4. Deploy (ProjectDashboardClient → "Pubblica sito")
   ├── Fetch blog_posts WHERE status = 'published'
   ├── Per ogni lingua: generateBlogListingHtml() → /blog/index.html
   ├── Per ogni articolo: generateBlogPostHtml() → /blog/{slug}/index.html
   ├── Upload su Cloudflare Pages via Wrangler
   └── Sitemap aggiornata con URL blog
```
