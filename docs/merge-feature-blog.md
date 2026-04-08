# Analisi Merge: `feature/blog` → `master`

> **Data analisi:** 2026-04-08  
> **Branch sorgente:** `feature/blog` (1 commit: `da6907d feat: blog`)  
> **Branch target:** `master` (17+ commit di vantaggio: multilang, nav/footer globali, performance, AI, social links)  
> **Stato migrazioni DB:** ✅ Già applicate — non includere nei task operativi

---

## Contesto del Disallineamento

`feature/blog` è stato creato prima di una serie di modifiche strutturali su `master`:
- Separazione nav/footer dai blocchi → `siteGlobals` table
- Sistema multilanguage completo (pagine con `language` + `translation_group_id`)
- Ottimizzazioni performance deploy (parallelizzazione download asset)
- Sistema limiti utente (`permissions.ts` + `get_user_limits`)
- AI generation con quota check (`canUseAI`)
- Social links in main nav

Il branch porta funzionalità nuove (blog post, editor articoli, blog-list block, generazione statica blog, sitemap blog) ma non conosce questi cambiamenti.

---

## ISSUES CRITICI

### 1. `lib/generate-static.tsx` — Firma incompatibile + siteGlobals assenti

**Problema:** `feature/blog` modifica `generateStaticHtml` aggiungendo `blogPosts` e `pageLang`, ma non implementa l'iniezione dei `siteGlobals` (nav/footer per lingua) introdotta da master.

**Master** (righe 13–36): fetcha `siteGlobals` per lingua e li inietta come virtual blocks intorno al contenuto di ogni pagina.  
**feature/blog**: aggiunge parametri blog ma ignora completamente il meccanismo `siteGlobals`.

**Risultato:** le pagine blog pubblicate non hanno navigazione né footer.

**Firma `renderBlock` — divergenza:**

```typescript
// master
function renderBlock(block, allPages, project, renderToStaticMarkup, commonVars?)

// feature/blog
export function renderBlock(block, allPages, project, renderToStaticMarkup, commonVars?, blogPosts?, pageLang?)
```

Problemi aggiuntivi:
- feature/blog la esporta (deve restare interna)
- Tutti i call a `renderBlock` in master devono ricevere i nuovi parametri opzionali

**File:** [lib/generate-static.tsx](generate-static.tsx)

---

### 2. `app/actions/deploy.ts` — Conflitto merge + regressione performance

Entrambi i branch hanno modificato questo file in sezioni sovrapposte.

**master ha aggiunto:**
- Download asset parallelizzati con `Promise.all`
- Caching anticipato dei limiti utente

**feature/blog ha aggiunto:**
- Fetch `blog_posts` (righe 77–82) prima della generazione pagine
- Generazione HTML per listing blog, singoli post, pagine autore
- Blog sitemap (riga ~352)

**Regressione critica:** feature/blog usa un loop sequenziale per i download degli asset, mentre master ha già risolto questo con `Promise.all`. Il merge naïve regresserebbe le performance di deploy per **tutti** i progetti, non solo quelli con blog.

**Fetch inefficiente in deploy.ts:**
```typescript
// feature/blog (righe 77-82)
const { data: blogPosts } = await supabase
  .from('blog_posts')
  .select('*')  // ⚠️ include blocks JSONB — potenzialmente 1-5MB per 50 post
  .eq('project_id', projectId)
  .eq('status', 'published')
```
Necessario per la generazione HTML, ma `select('*')` carica tutto incluso il JSONB dei blocchi. Accettabile (serve il contenuto completo), ma da documentare.

**File:** [app/actions/deploy.ts](backend-server-actions.md)

---

### 3. `app/actions/ai-generator.ts` — Server actions AI senza quota check

`feature/blog` aggiunge due server actions (`'use server'` presente ✅) ma **mancano completamente auth check e verifica quote**:

| Funzione | `'use server'` | Auth check | `canUseAI` | Incremento contatore |
|---|---|---|---|---|
| `generateProjectWithAI` | ✅ | ✅ | ✅ | ✅ |
| `improveTextWithAI` (nuova) | ✅ | ❌ | ❌ | ❌ |
| `translateBlogPostWithAI` (nuova) | ✅ | ❌ | ❌ | ❌ |

**Rischio:** utenti su piano free o non autenticati possono chiamare queste action senza limiti, consumando API Gemini senza quota enforcement.

**Pattern corretto** (da `generateProjectWithAI`, righe 123–149):
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Non autenticato');
const aiCheck = await canUseAI(user.id);
if (!aiCheck.allowed) throw new Error(aiCheck.reason);
// ... chiama API ...
// incrementa contatore dopo la chiamata
```

**File:** [app/actions/ai-generator.ts](backend-server-actions.md)

> **Nota UI:** Per ora i pulsanti "Migliora con AI" e "Traduci con AI" nell'editor articoli **devono essere nascosti completamente** nell'interfaccia (indipendentemente dal piano), in attesa di tarare la feature sul sistema di utilizzo AI. Vedi sezione [Punto futuro: AI in articoli](#punto-futuro-ai-in-articoli).

---

### 4. `lib/permissions.ts` — Manca `canCreateArticle()`

Il piano prevede `max_articles_per_project` in `get_user_limits`, ma non esiste la funzione di verifica.

**Impatto:** qualsiasi utente (anche free) può creare articoli illimitati. Il pulsante "Nuovo Articolo" in `ProjectDashboardClient` è sempre attivo e il salvataggio non valida il limite.

**Analogia esistente:** `canCreatePage(userId, projectId)` — stessa logica, stessa struttura.

**File:** [lib/permissions.ts](piani-e-permessi.md), [app/editor/[projectId]/ProjectDashboardClient.tsx](project-structure.md)

---

### 5. Image Upload — Path errato, RLS fallisce

`BlogPostEditorClient` usa:
```typescript
const path = `${initialProject.id}/${filename}`;
supabase.storage.from('project-assets').upload(path, file)
```

La policy RLS di storage controlla che il **primo segmento del path** sia `auth.uid()` (userId). Feature/blog usa `projectId` come primo segmento → **upload rifiutato silenziosamente dalla RLS**.

**Pattern corretto del sistema:**
```
project-assets/{userId}/{projectId}/{filename}
```

**Fix:**
```typescript
const path = `${initialProject.user_id}/${initialProject.id}/${filename}`;
// e usare resolveImageUrl() per restituire l'URL corretto
```

**File:** [components/editor/BlogPostEditorClient.tsx](project-structure.md) (nel branch feature/blog)

---

### 6. `lib/generate-blog-static.tsx` — Nav/footer hardcodati

Il generatore statico dedicato al blog ha HTML hardcodato per header e footer invece di usare i `siteGlobals`. Le pagine blog pubblicate avranno struttura e stile diversi dal resto del sito.

**File:** [lib/generate-blog-static.tsx](static-generation.md)

---

## ISSUES ALTI

### 7. `components/editor/EditorBlockWrapper.tsx` — Query inefficiente + Paginazione futura

Nel blocco `blog-list`, l'editor fetcha tutti i post con `select('*')`, caricando il JSONB completo dei blocchi solo per mostrare una lista.

```typescript
// righe 45-54 — usa select('*') quando bastano pochi campi
supabase.from('blog_posts').select('*').eq('project_id', project.id)

// fix immediato
supabase.from('blog_posts')
  .select('id, slug, title, language, status, cover_image, published_at')
  .eq('project_id', project.id)
```

**File:** [components/editor/EditorBlockWrapper.tsx](project-structure.md)

> **Punto futuro: paginazione articoli in editor**
> Al crescere del numero di articoli (> 50), il fetch unico diventerà lento anche con la select ottimizzata. Sarà necessario aggiungere paginazione (`.range(offset, offset+pageSize-1)`) con un bottone "carica altri" nel pannello blog di `ProjectDashboardClient`. La stessa logica si applicherà al blocco `blog-list` in anteprima editor.

---

### 8. Multi-lingua — `can_multilang` non verificata per articoli

**Cosa è corretto** in feature/blog (confermato dall'analisi):
- ✅ `blog_posts` ha `language` e `translation_group` 
- ✅ URL consistenti con pagine: `/blog/slug` (default), `/en/blog/slug` (non-default)
- ✅ `BlogListBlock` filtra per lingua
- ✅ Sitemap include blog post con prefissi lingua corretti
- ✅ `TranslateBlogModal` rispetta `project.settings.languages`

**Cosa manca:**
- ❌ Nessun check `can_multilang` prima di aprire `TranslateBlogModal`
- ❌ Utenti senza piano multilang possono tradurre articoli (solo lato UI, ma nessuna validazione server-side)

> **Decisione attuale:** Nascondere `TranslateBlogModal` a prescindere dal piano. Attivare quando il sistema multilang è consolidato anche sugli articoli. Vedi [Punto futuro: traduzione articoli](#punto-futuro-traduzione-articoli).

---

### 9. `ProjectDashboardClient.tsx` — Mancano limiti visibili

Il tab blog/articoli non mostra all'utente quanti articoli ha usato e quanti ne ha disponibili, a differenza di come vengono gestite le pagine.

**File:** [app/editor/[projectId]/ProjectDashboardClient.tsx](project-structure.md)

---

## ISSUES MEDI

### 10. `lib/block-definitions.ts` — `BlockType` mancante

Il tipo `BlockType` nel branch master non include `'blog-list'`. Questo causa type errors quando il codice di feature/blog viene integrato.

**File:** [lib/block-definitions.ts](project-structure.md), [types/editor.ts](project-structure.md)

---

### 11. Index mancante su `(project_id, language)` in `blog_posts`

Gli indici esistenti coprono bene la maggior parte dei casi:
- ✅ `idx_blog_posts_project` su `(project_id)`
- ✅ `idx_blog_posts_status` su `(project_id, status)`
- ✅ `idx_blog_posts_published` su `(project_id, published_at DESC)` WHERE published

**Manca:** index su `(project_id, language)` — su siti multilingua con molti post, il filtro per lingua non usa un indice dedicato. Non critico finché i volumi sono bassi (< 200 post/progetto), ma da aggiungere come migrazione futura.

---

## PERFORMANCE & SICUREZZA: ANALISI COMPLESSIVA

### Server Actions

| Action | Auth | Quota | RLS | Note |
|---|---|---|---|---|
| `deployToCloudflare` | ✅ `getUser()` | N/A | ✅ `.eq('user_id', uid)` | Corretto |
| `generateProjectWithAI` | ✅ | ✅ `canUseAI` | ✅ | Corretto |
| `improveTextWithAI` (nuova) | ❌ | ❌ | N/A | **Da fixare** |
| `translateBlogPostWithAI` (nuova) | ❌ | ❌ | N/A | **Da fixare + nascondere UI** |

### RLS blog_posts

La policy è corretta: verifica l'ownership tramite subquery su `projects`:
```sql
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
```
Copre ALL operations. `EditorBlockWrapper` usa il client browser con chiave anon → RLS applicata automaticamente.

### Consistenza URL Multilang

Confermata la consistenza tra il sistema pagine e il sistema blog:

| Risorsa | Default lang | Non-default lang |
|---|---|---|
| Pagina `/about` | `/about.html` | `/en/about.html` |
| Blog listing | `/blog/index.html` | `/en/blog/index.html` |
| Blog post `/my-post` | `/blog/my-post.html` | `/en/blog/my-post.html` |
| Autore `john-doe` | `/blog/author/john-doe.html` | `/en/blog/author/john-doe.html` |

---

## NOTE FUTURE

### Punto futuro: AI in articoli

I pulsanti "Migliora con AI" e "Traduci con AI" nell'editor articoli vanno **nascosti a prescindere** nell'attuale release del merge. Prima di attivarli:
1. Aggiungere `auth.getUser()` e `canUseAI()` check in `improveTextWithAI` e `translateBlogPostWithAI`
2. Decidere se condividono il contatore mensile con `generateProjectWithAI` o hanno un contatore separato
3. Verificare UX: mostrare feedback all'utente quando la quota è esaurita
4. Considerare se "migliora testo" deve costare 1 credito o meno rispetto alla generazione completa

### Punto futuro: generazione HTML incrementale

Attualmente ogni deploy rigenera l'HTML di **tutte** le pagine e di **tutti** i blog post, anche se solo un articolo è cambiato. Con siti grandi (50+ pagine, 100+ post) questo ha un impatto significativo sul tempo di deploy.

**Approccio consigliato per il futuro:**
1. Salvare un hash del contenuto di ogni pagina/post al momento dell'ultimo deploy (campo `last_deployed_hash` su `pages` e `blog_posts`)
2. Al deploy, calcolare l'hash corrente e confrontarlo con quello salvato
3. Rigenerare l'HTML solo per le entità il cui hash è cambiato
4. Sempre rigenerare: sitemap, robots.txt, CSS Tailwind (dipende da tutte le pagine)
5. Upload su Cloudflare Pages solo dei file cambiati

**Complessità:** media — richiede una colonna DB aggiuntiva, logica di diff durante il deploy, e gestione del caso "prima pubblicazione" (tutto da generare). Da pianificare dopo che il sistema blog è stabile in produzione.

---

### Punto futuro: traduzione articoli

`TranslateBlogModal` va nascosta completamente nell'attuale release. Prima di attivarla:
1. Aggiungere check `can_multilang` nel componente (passare `userLimits` da `page.tsx`)
2. Aggiungere validazione server-side che l'utente possa tradurre
3. Assicurarsi che il contatore AI venga incrementato anche per `translateBlogPostWithAI`
4. Verificare che il `translation_group` sia gestito coerentemente con il sistema pagine (stesso UUID condiviso tra traduzioni)

### Punto futuro: index DB lingua

Aggiungere migrazione:
```sql
CREATE INDEX idx_blog_posts_language 
  ON blog_posts(project_id, language) 
  WHERE status = 'published';
```
Priorità: quando il sistema multilang è attivo e il volume di post cresce.

---

## TABELLA RIEPILOGATIVA FILE IMPATTATI

| File | Priorità | Tipo | Intervento |
|---|---|---|---|
| [lib/generate-static.tsx](generate-static.tsx) | 🔴 Critica | Conflitto | Merge firma + siteGlobals injection |
| [app/actions/deploy.ts](backend-server-actions.md) | 🔴 Critica | Conflitto | Merge blog gen + mantieni Promise.all |
| [app/actions/ai-generator.ts](backend-server-actions.md) | 🔴 Alta | Sicurezza | Aggiungere auth + canUseAI; nascondere UI |
| [lib/permissions.ts](piani-e-permessi.md) | 🔴 Alta | Feature | Aggiungere `canCreateArticle()` |
| BlogPostEditorClient.tsx | 🔴 Alta | Bug | Fix path upload immagini |
| [lib/generate-blog-static.tsx](static-generation.md) | 🟠 Alta | Integrazione | Sostituire nav/footer hardcodati con siteGlobals |
| ProjectDashboardClient.tsx | 🟠 Alta | Feature | Check limite articoli + pulsante "Nuovo Articolo" |
| TranslateBlogModal.tsx | 🟠 Alta | Feature | Nascondere completamente (TODO futuro) |
| [components/editor/EditorBlockWrapper.tsx](project-structure.md) | 🟠 Media | Performance | `select('*')` → `select('id,slug,title,...')` |
| [lib/block-definitions.ts](project-structure.md) | 🟡 Media | Type | Aggiungere `'blog-list'` a `BlockType` |
| [types/editor.ts](project-structure.md) | 🟡 Bassa | Type | Verificare integrazione `BlogPost` interface |
| [package.json](project-structure.md) | ✅ OK | Dep | `marked` + `@tailwindcss/typography` non conflittuali |

---

## PIANO OPERATIVO COMPLETO

> Le migrazioni DB sono già state applicate. I passi seguono un ordine di priorità che minimizza i rischi durante il merge.

---

### FASE 0 — Cosa devi fare TU (il developer)

**Comandi git da eseguire prima che Claude risolva i file:**
```bash
git checkout master
git merge feature/blog --no-commit --no-ff
# NON committare — lascia i conflitti aperti
```

**Poi, dopo che Claude risolve tutti i file:**
```bash
pnpm install           # installa marked e @tailwindcss/typography
pnpm build             # verifica type errors
# esegui i test (vedi sezione test)
git add -A
git commit -m "feat: merge feature/blog — articoli, editor blog, BlogListBlock"
```

**Nient'altro**: tutti i conflitti di codice, fix di sicurezza, ottimizzazioni e nuovi file vengono risolti da Claude direttamente.

---

### FASE 1 — Conflitti Già Risolti da Claude

I seguenti file vengono risolti direttamente senza necessità di intervento manuale:

| File | Tipo risoluzione |
|---|---|
| `lib/generate-static.tsx` | Merge firma: siteGlobals + blogPosts + renderBlock esteso |
| `app/actions/deploy.ts` | Merge: siteGlobals + blog generation + bucket path corretto + Promise.all |
| `app/actions/ai-generator.ts` | Aggiunte improveTextWithAI/translateBlogPostWithAI con auth+canUseAI |
| `components/editor/EditorBlockWrapper.tsx` | Query ottimizzata + fetch blog posts |
| `lib/block-definitions.ts` | Aggiunto tipo blog-list |
| `types/editor.ts` | Aggiunta interface BlogPost |
| `app/editor/[projectId]/page.tsx` | Aggiunto fetch blogPosts ottimizzato |
| `app/editor/[projectId]/ProjectDashboardClient.tsx` | Tab blog + canCreateArticle + AI/translate nascosti |
| `lib/permissions.ts` | Aggiunta canCreateArticle() |
| Nuovi file da feature/blog | Copiati e fixati (upload path, AI buttons nascosti) |
| `package.json` | Aggiunte dipendenze |

---

### FASE 2 — Risoluzione Conflitti Core

#### 2a. `lib/generate-static.tsx`

**Obiettivo:** firma unificata che accetta sia `siteGlobals` (master) che `blogPosts` (feature/blog).

1. Nella firma di `generateStaticHtml`, aggiungere `blogPosts?: BlogPost[]` accanto ai parametri esistenti di master
2. Mantenere tutta la logica di iniezione `siteGlobals` (nav/footer per lingua) di master
3. Nella firma di `renderBlock`, aggiungere `blogPosts?` e `pageLang?` come ultimi parametri opzionali — **NON esportarla**
4. Aggiornare tutti i call interni a `renderBlock` per passare i nuovi parametri quando disponibili
5. Integrare la logica di filtro `pageLang` di feature/blog per `BlogListBlock`

#### 2b. `app/actions/deploy.ts`

**Obiettivo:** blog generation + performance di master.

1. Mantenere il fetch `blogPosts` di feature/blog (righe 77–82) — posizionarlo dopo l'auth check, prima del loop pagine
2. **Mantenere il `Promise.all` di master** per i download asset — non usare il loop sequenziale di feature/blog
3. Aggiungere la generazione HTML dei blog post dopo la generazione delle pagine normali
4. Aggiornare la chiamata `generateSitemap` per passare `blogPosts`
5. Verificare che `generateStaticHtml` riceva i nuovi parametri

#### 2c. `app/actions/ai-generator.ts`

1. Mantenere `improveTextWithAI` e `translateBlogPostWithAI` nel file (servono)
2. Aggiungere auth check e `canUseAI` (anche se la UI sarà nascosta, la action deve essere sicura)
3. Aggiungere incremento contatore AI dopo ogni chiamata API riuscita

#### 2d. `lib/block-definitions.ts` e `types/editor.ts`

1. Aggiungere `'blog-list'` al tipo `BlockType`
2. Integrare l'interface `BlogPost` in `types/editor.ts`
3. Registrare la definizione del blocco `blog-list` nell'elenco blocchi

---

### FASE 3 — Fix Sicurezza e Permessi

#### 3a. Fix server actions AI (`app/actions/ai-generator.ts`)

```typescript
export async function improveTextWithAI(text: string, instructions: string): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');
  
  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) throw new Error(aiCheck.reason);
  
  // ... logica esistente ...
  
  // incrementa contatore
  await incrementAIUsage(user.id);
  return result;
}
```
Stesso pattern per `translateBlogPostWithAI`.

#### 3b. Aggiungere `canCreateArticle()` in `lib/permissions.ts`

```typescript
export async function canCreateArticle(
  userId: string, 
  projectId: string
): Promise<PermissionCheck> {
  const limits = await getUserLimits(userId);
  if (limits.max_articles_per_project === null) return { allowed: true };
  
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  
  if ((count || 0) >= limits.max_articles_per_project) {
    return { 
      allowed: false, 
      reason: `Hai raggiunto il limite di ${limits.max_articles_per_project} articoli per questo progetto` 
    };
  }
  return { allowed: true };
}
```

#### 3c. Integrare `canCreateArticle()` in `ProjectDashboardClient.tsx`

1. Caricare `userLimits` nella pagina (già disponibile da master)
2. Passare il check al tab blog
3. Disabilitare il pulsante "Nuovo Articolo" se il limite è raggiunto
4. Mostrare il contatore `X / Y articoli usati`

---

### FASE 4 — Fix Image Upload

In `BlogPostEditorClient.tsx`:

```typescript
// PRIMA (errato — RLS fail)
const path = `${initialProject.id}/${filename}`;

// DOPO (corretto)
const path = `${initialProject.user_id}/${initialProject.id}/${filename}`;

// E per restituire l'URL usare il sistema esistente:
// resolveImageUrl o il pattern usato dal resto dell'app
```

Verificare che `initialProject.user_id` sia disponibile nel componente. Se non lo è, aggiungerlo alla query in `page.tsx`.

---

### FASE 5 — Integrazione Nav/Footer in Blog Pages

In `lib/generate-blog-static.tsx`:

1. Aggiungere parametro `siteGlobals` alla funzione di generazione
2. Sostituire HTML hardcodato di nav e footer con l'output del renderBlock dei global blocks
3. Assicurarsi che il call in `deploy.ts` passi i `siteGlobals` fetched

**Alternativa:** integrare la generazione blog post direttamente in `generateStaticHtml` (come pagine speciali), evitando il file separato. Valutare in base alla complessità.

---

### FASE 6 — Nascondere UI Temporanea

#### Nascondere AI buttons in editor articoli

In `BlogPostEditorClient.tsx`, commentare o rimuovere i pulsanti "Migliora con AI" e "Traduci con AI". Non eliminare le action server — servono per il futuro.

```tsx
{/* TODO: Attivare quando le action AI hanno auth+quota check e la feature è tarata
<button onClick={handleImproveWithAI}>Migliora con AI</button>
*/}
```

#### Nascondere TranslateBlogModal

In `BlogPostEditorClient.tsx` o dove viene triggerata, rimuovere il pulsante/tab che apre `TranslateBlogModal`. Non eliminare il componente.

```tsx
{/* TODO: Attivare quando can_multilang è verificato per articoli (vedi docs/merge-feature-blog.md)
<button onClick={() => setShowTranslateModal(true)}>Traduci articolo</button>
*/}
```

---

### FASE 7 — Fix Performance Query Editor

In `components/editor/EditorBlockWrapper.tsx`, riga ~49:

```typescript
// PRIMA
supabase.from('blog_posts').select('*').eq('project_id', project.id)

// DOPO
supabase.from('blog_posts')
  .select('id, slug, title, language, status, cover_image, published_at, excerpt')
  .eq('project_id', project.id)
  .order('created_at', { ascending: false })
```

---

### FASE 8 — Install dipendenze e build check

```bash
pnpm install
# verifica che marked e @tailwindcss/typography siano installati
pnpm build
# risolvi eventuali type errors (BlogPost, BlockType, ecc.)
```

---

### FASE 9 — Test Operativi

Eseguire questi test **nell'ordine indicato** su un progetto di test:

#### Test A — Upload immagine cover articolo
1. Aprire editor articolo → caricare un'immagine cover
2. Verificare che l'upload non ritorni errore
3. Verificare in Supabase Storage che il file sia in `project-assets/{userId}/{projectId}/`
4. Verificare che l'immagine sia visibile nell'editor

#### Test B — Creazione articolo e limite
1. Con piano free (max_articles_per_project = N): creare N articoli
2. Verificare che al tentativo di creare il (N+1)-esimo, il pulsante sia disabilitato o l'errore sia mostrato
3. Verificare il contatore visibile nell'UI

#### Test C — Deploy con blog attivo
1. Aggiungere il blocco `blog-list` a una pagina
2. Creare 2-3 articoli pubblicati
3. Avviare il deploy
4. Verificare che le seguenti pagine esistano nel sito pubblicato:
   - `/blog/index.html` — listing
   - `/blog/{slug}.html` — singolo post
   - `/blog/author/{author}.html` — pagina autore
5. Verificare che nav e footer siano presenti in tutte le pagine blog

#### Test D — Multilang con blog
1. Progetto con 2 lingue (it + en), default = it
2. Articolo in italiano: verificare URL `/blog/slug.html`
3. Articolo in inglese: verificare URL `/en/blog/slug.html`
4. Blog listing in inglese: verificare URL `/en/blog/index.html`
5. Sitemap: verificare che entrambi gli articoli siano presenti con URL corretti

#### Test E — BlogListBlock in editor
1. Aggiungere blocco `blog-list` alla pagina
2. Verificare che il blocco mostri i post in anteprima nell'editor
3. Con multilang attivo: verificare che il blocco filtri per lingua della pagina

#### Test F — Sicurezza (opzionale, richiede strumenti dev)
1. Chiamare `improveTextWithAI` senza sessione autenticata → deve tornare errore auth
2. Tentare upload immagine con path manomesso → RLS deve bloccare
3. Verificare nei log Supabase che non ci siano accessi non autorizzati

#### Test G — Performance deploy
1. Deploy con 10+ articoli pubblicati
2. Verificare nei log che i download asset siano parallelizzati (non sequenziali)
3. Confrontare tempi con deploy precedente

---

### Checklist Finale Prima del Merge in `master`

- [ ] `pnpm build` senza errori TypeScript
- [ ] Test A: upload immagine cover ✅
- [ ] Test B: limite articoli rispettato ✅
- [ ] Test C: deploy con nav/footer nelle pagine blog ✅
- [ ] Test D: URL multilang corretti ✅
- [ ] Test E: BlogListBlock funzionante in editor ✅
- [ ] UI "Migliora con AI" nascosta ✅
- [ ] UI "Traduci articolo" nascosta ✅
- [ ] `improveTextWithAI` ha auth+canUseAI check ✅
- [ ] `translateBlogPostWithAI` ha auth+canUseAI check ✅
- [ ] `canCreateArticle()` implementata e integrata ✅
- [ ] Path upload immagini corretto (`{userId}/{projectId}/`) ✅
- [ ] Query `EditorBlockWrapper` ottimizzata ✅
