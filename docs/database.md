# Database — Schema, Tabelle, Funzioni e Storage

> Supabase (PostgreSQL) con Row-Level Security.

---

## Diagramma relazioni

```
auth.users
  ├── (1:1) profiles
  │          └── (N:1) plans
  │
  └── (1:N) projects
              ├── (1:N) pages
              │          └── translations_group_id (collega traduzioni)
              │
              ├── (1:N) site_globals (nav/footer per lingua)
              │
              └── (1:N) blog_posts
                         └── translation_group (collega articoli in lingue diverse)

storage.buckets
  └── project-assets (immagini e file utente)
```

---

## Tabelle

### projects

Ogni riga e un sito web creato da un utente.

- **id** UUID PK — `uuid_generate_v4()`
- **user_id** UUID FK → `auth.users(id)` — proprietario
- **name** TEXT NOT NULL — nome visualizzato
- **subdomain** TEXT UNIQUE NOT NULL — slug per URL (es. `pizzeria-roma`)
- **custom_domain** TEXT UNIQUE nullable — dominio custom (es. `www.pizzeriaroma.it`)
- **domain_status** TEXT nullable — `'pending'`, `'verified'`, `'failed'`
- **last_domain_check** TIMESTAMPTZ nullable — ultimo check DNS
- **settings** JSONB default `'{}'` — configurazioni progetto (vedi ProjectSettings sotto)
- **live_url** TEXT nullable — URL pubblico dopo il primo deploy
- **last_published_at** TEXT nullable — ISO timestamp ultimo deploy
- **created_at** TIMESTAMPTZ default `now()`

RLS: utenti vedono/modificano solo i propri progetti (`auth.uid() = user_id`).

---

### pages

Pagine di un sito. Ogni pagina ha un slug, una lingua e un array di blocchi JSON.

- **id** UUID PK — `uuid_generate_v4()`
- **project_id** UUID FK → `projects(id)` ON DELETE CASCADE
- **slug** TEXT NOT NULL — slug URL (es. `home`, `about`, `contatti`)
- **title** TEXT NOT NULL — titolo pagina
- **language** TEXT default `'it'` — codice lingua
- **blocks** JSONB default `'[]'` — array di blocchi (`Block[]`)
- **seo** JSONB default `'{}'` — `{ title, description, image, indexable }`
- **translations_group_id** UUID nullable — collega pagine che sono traduzioni dello stesso contenuto
- **created_at** TIMESTAMPTZ default `now()`
- **updated_at** TIMESTAMPTZ default `now()`

Unique: `(project_id, slug, language)` — stesso slug permesso in lingue diverse.

Index: `pages_translations_group_id_idx` su `translations_group_id`.

RLS: accesso solo alle pagine dei propri progetti.

---

### site_globals

Nav e footer globali, uno per lingua per progetto. Non sono nei blocchi delle pagine — sono separati e iniettati a build time.

- **id** UUID PK — `gen_random_uuid()`
- **project_id** UUID FK → `projects(id)` ON DELETE CASCADE
- **language** TEXT NOT NULL — codice lingua
- **type** TEXT NOT NULL CHECK `('navigation', 'footer')` — tipo di blocco globale
- **content** JSONB default `'{}'` — contenuto del blocco
- **style** JSONB default `'{}'` — stile del blocco
- **updated_at** TIMESTAMPTZ default `now()`

Unique: `(project_id, language, type)` — una nav e un footer per lingua.

Index: `site_globals_project_id_idx`, `site_globals_project_lang_idx`.

RLS: accesso solo ai globals dei propri progetti.

---

### blog_posts

Articoli del blog. Uno per lingua per progetto, collegati tramite `translation_group`.

- **id** UUID PK — `uuid_generate_v4()`
- **project_id** UUID FK → `projects(id)` ON DELETE CASCADE
- **slug** TEXT — unico per `(project_id, slug, language)`
- **title** TEXT
- **excerpt** TEXT nullable
- **cover_image** TEXT nullable — path asset `/assets/{filename}`
- **categories** JSONB default `'[]'` — `string[]`
- **authors** JSONB default `'[]'` — `{ name, slug, bio?, avatar? }[]`
- **status** TEXT — `'draft'` o `'published'`
- **published_at** TIMESTAMPTZ nullable
- **blocks** JSONB default `'[]'` — nella pratica un blocco `{ type:'text', content:{ text: '<markdown>' } }`
- **seo** JSONB default `'{}'` — `{ title?, description?, image?, indexable? }`
- **language** TEXT default `'it'`
- **translation_group** UUID nullable — collega articoli che sono traduzioni dello stesso contenuto
- **created_at** TIMESTAMPTZ default `now()`
- **updated_at** TIMESTAMPTZ default `now()`

Index: `blog_posts_project_lang_idx`, `blog_posts_translation_group_idx`, `blog_posts_project_published_idx`.

RLS: accesso solo agli articoli dei propri progetti.

Migration: `supabase/migration_blog.sql` — eseguire dopo `permissions_system.sql`.

---

### profiles

Profilo utente con piano, quote e tracking utilizzo.

- **id** UUID PK FK → `auth.users(id)` ON DELETE CASCADE
- **plan_id** TEXT FK → `plans(id)` default `'free'`
- **storage_used_bytes** BIGINT default `0` — aggiornato automaticamente da trigger
- **storage_warning_sent_at** TIMESTAMPTZ nullable — per email warning 80%
- **ai_generations_this_month** INTEGER default `0` — contatore mensile
- **ai_month_reset_at** TIMESTAMPTZ default `date_trunc('month', now())` — ultimo reset
- **override_max_projects** INTEGER nullable — sovrascrive limite piano
- **override_max_pages_per_project** INTEGER nullable
- **override_max_storage_mb** INTEGER nullable
- **override_max_ai_per_month** INTEGER nullable
- **override_max_articles_per_project** INTEGER nullable
- **created_at** TIMESTAMPTZ default `now()`
- **updated_at** TIMESTAMPTZ default `now()`

I campi `override_*` permettono di personalizzare i limiti per singolo utente senza cambiare piano (es. utente beta, promozione, ecc.).

RLS: utenti vedono/modificano solo il proprio profilo.

Trigger: `on_auth_user_created` → crea automaticamente un profilo con piano `free` quando un utente si registra.

---

### plans

Definizioni dei piani tariffari. Tabella di sola lettura (pubblica).

- **id** TEXT PK — `'free'`, `'starter'`, `'pro'`, `'agency'`
- **name** TEXT NOT NULL — nome visualizzato
- **description** TEXT nullable
- **max_projects** INTEGER nullable — NULL = illimitato
- **max_pages_per_project** INTEGER nullable
- **max_storage_mb** INTEGER nullable
- **max_ai_per_month** INTEGER nullable
- **max_articles_per_project** INTEGER nullable
- **can_custom_domain** BOOLEAN default `false`
- **can_custom_scripts** BOOLEAN default `false`
- **can_multilang** BOOLEAN default `false`
- **can_remove_branding** BOOLEAN default `false`
- **sort_order** INTEGER default `0`
- **created_at** TIMESTAMPTZ default `now()`

Valori attuali:

**free:** 1 progetto, 3 pagine, 50MB, 3 AI/mese, 10 articoli, no domain/scripts/multilang/branding

**starter:** 3 progetti, 7 pagine, 500MB, 15 AI/mese, 50 articoli, custom domain, no scripts/multilang

**pro:** 10 progetti, 25 pagine, 2GB, 50 AI/mese, articoli illimitati, tutto tranne rimozione branding

**agency:** tutto illimitato, tutte le feature

RLS: leggibile da tutti (anche non autenticati).

---

## Stored Functions

### get_user_limits(p_user_id UUID)

Restituisce i limiti effettivi per un utente, combinando piano + override.

Ritorna:
- `plan_id`, `max_projects`, `max_pages_per_project`, `max_storage_mb`, `max_ai_per_month`, `max_articles_per_project`
- `can_custom_domain`, `can_custom_scripts`, `can_multilang`, `can_remove_branding`
- `storage_used_bytes`, `ai_used_this_month`

Logica:
1. Fetch profilo e piano dell'utente
2. Se il mese e cambiato, resetta `ai_generations_this_month` a 0
3. Per ogni limite: `COALESCE(override, valore_piano)`
4. Restituisce una riga con tutti i valori

Chiamata da `lib/permissions.ts` → `getUserLimits()`.

### increment_ai_usage(p_user_id UUID)

Incrementa atomicamente `ai_generations_this_month` di 1.

Chiamata da `app/actions/ai-generator.ts` dopo ogni generazione AI riuscita.

### track_storage_usage()

Trigger function su `storage.objects` (AFTER INSERT, UPDATE, DELETE).

Logica:
1. Estrae lo userId dal path del file (`{userId}/{projectId}/{filename}`)
2. Calcola il delta di dimensione
3. Aggiorna `profiles.storage_used_bytes` con `GREATEST(0, old + delta)`

### handle_new_user()

Trigger function su `auth.users` (AFTER INSERT).

Crea automaticamente un profilo con `plan_id = 'free'` e `ai_month_reset_at = now()`.

---

## Storage

### Bucket: project-assets

Contiene tutte le immagini e file caricati dagli utenti.

Struttura path:
- `{userId}/{projectId}/{filename}` — asset del progetto (es. `img_a1b2c3.webp`)
- `ai-temp/{userId}/{filename}` — file temporanei generazione AI (cleanup settimanale)

Formato filename: `img_{SHA256_hash}.{ext}` — hash del contenuto per deduplicazione.

RLS:
- **Lettura:** pubblica (i siti pubblicati devono poter caricare le immagini)
- **Scrittura:** solo autenticati, solo nella propria cartella
- **Cancellazione:** solo autenticati, solo i propri file

---

## Edge Functions

### cleanup-storage

File: `supabase/functions/cleanup-storage/index.ts`

Scopo: pulizia settimanale file orfani.

Schedulazione: cron ogni lunedi alle 03:00 UTC (o invocazione manuale via POST).

Logica:
1. Per ogni progetto, lista tutti i file in storage
2. Scansiona tutti i blocchi delle pagine e i settings del progetto per trovare i filename referenziati
3. Elimina i file non referenziati da nessun blocco/setting
4. Pulisce `ai-temp/` — elimina file piu vecchi di 1 ora

Ritorna report: `{ projects_scanned, files_removed, ai_temp_removed, errors[] }`

---

## Migration — Ordine di esecuzione

1. **schema.sql** — Tabelle core (projects, pages)
2. **upgrade.sql** — Aggiunge title e seo a pages
3. **update_v3.sql** — Aggiunge settings a projects
4. **ai_credits.sql** — Crea tabella profiles
5. **add_custom_domain.sql** — Aggiunge colonne dominio a projects
6. **migration_i18n.sql** — Aggiunge language a pages
7. **migration_multilang.sql** — Crea site_globals
8. **migration_data_one_shot.sql** — Migra nav/footer da pages.blocks a site_globals (una tantum, fare backup prima)
9. **permissions_system.sql** — Crea plans, estende profiles, aggiunge RLS/funzioni/trigger
10. **cleanup_legacy_ai_column.sql** — Rimuove colonne AI legacy da profiles
11. **fix_storage_security.sql** — Crea bucket e policy storage
12. **migration_blog.sql** — Crea blog_posts con RLS, indici e trigger updated_at

---

## JSONB: ProjectSettings

Il campo `projects.settings` contiene:

**Tema e aspetto**
- `fontFamily` — font Google Fonts
- `primaryColor`, `secondaryColor` — colori principali
- `appearance` — `'light'` o `'dark'`
- `themeColors` — `{ light: {bg, text}, dark: {bg, text}, buttonText, buttonTextSecondary }`
- `favicon`, `logo` — path asset

**Bottoni**
- `buttonRadius`, `buttonShadow`, `buttonBorder`, `buttonBorderColor`
- `buttonBorderWidth`, `buttonPaddingX`, `buttonPaddingY`
- `buttonFontSize`, `buttonWidth`, `buttonUppercase`, `buttonAnimation`

**SEO globale**
- `metaTitle`, `metaDescription`, `metaImage`

**Business (Schema.org)**
- `businessType` — es. `'LocalBusiness'`, `'Restaurant'`
- `businessDetails` — `{ address, city, postalCode, country, phone, email, businessName, priceRange, servesCuisine }`

**Multilingua**
- `languages` — es. `['it', 'en', 'fr']`
- `defaultLanguage` — es. `'it'`

**Tipografia**
- `typography` — `{ h1Size, h2Size, h3Size, h4Size, h5Size, h6Size, bodySize }`

**CTA flottante**
- `floatingCTA` — `{ enabled, label, url, theme }`

**Custom code**
- `customScriptsHead`, `customScriptsBody` — script iniettati nell'HTML statico

**Dominio**
- `customDomain`, `domainStatus`

**Responsive**
- `responsive` — `{ mobile: Partial<ProjectSettings>, tablet: Partial<ProjectSettings> }`

---

## JSONB: Block

Il campo `pages.blocks` e un array di:

- **id** string — UUID del blocco
- **type** BlockType — `'hero'`, `'text'`, `'navigation'`, `'footer'`, `'image'`, `'image-text'`, `'gallery'`, `'map'`, `'features'`, `'contact'`, `'reviews'`, `'product-carousel'`, `'embed'`, `'faq'`, `'quote'`, `'divider'`, `'logos'`, `'cards'`, `'benefits'`, `'how-it-works'`, `'pdf'`, `'pricing'`, `'promo'`
- **content** any — dati specifici del blocco (testi, immagini, link, items)
- **style** any — stili (padding, allineamento, colori, animazioni, pattern)
- **responsiveStyles** opzionale — `{ tablet?: any, mobile?: any }` — override per viewport

---

## Come il codice accede al DB

### Server Actions (app/actions/)

Tutte le mutazioni passano da Server Actions (`'use server'`).

- **projects.ts** — `createProject()`: insert in projects + site_globals + pages
- **pages.ts** — `createPage()`, `translatePage()`: insert/update pages, update site_globals
- **deploy.ts** — `deployToCloudflare()`: select projects + pages + site_globals, read-only
- **ai-generator.ts** — `generateProjectWithAI()`: rpc `increment_ai_usage`, insert projects + pages + site_globals

### Permessi (lib/permissions.ts)

Prima di ogni operazione che crea risorse:
- `canCreateProject(userId)` — conta progetti, confronta con limite
- `canCreatePage(userId, projectId)` — conta pagine, confronta con limite
- `canUseAI(userId)` — confronta AI usate con limite mensile

Tutti chiamano `rpc('get_user_limits')` per ottenere i limiti effettivi.

### Storage (supabase.storage)

- **Upload:** `storage.from('project-assets').upload(path, file)` — in ai-generator.ts e nell'editor
- **Download:** `storage.from('project-assets').download(path)` — in deploy.ts
- **List:** `storage.from('project-assets').list(prefix)` — in cleanup edge function
- **Delete:** `storage.from('project-assets').remove(paths)` — in cleanup edge function

---

## Sicurezza

Ogni tabella ha RLS abilitato. Le policy garantiscono:

- **projects** — accesso solo ai propri (`user_id = auth.uid()`)
- **pages** — accesso solo a pagine di propri progetti (subquery su projects)
- **site_globals** — accesso solo a globals di propri progetti (subquery su projects)
- **profiles** — accesso solo al proprio profilo (`id = auth.uid()`)
- **plans** — lettura pubblica
- **storage** — lettura pubblica, scrittura solo autenticati nella propria cartella

Le Server Actions aggiungono un secondo livello: controllano quote e permessi del piano prima di eseguire operazioni.
