# Backend e Server Actions — Specifiche Tecniche

> Documento di riferimento per tutta la logica backend: Server Actions, Edge Functions, architettura delle procedure e limiti noti.

---

## Indice

1. [Server Actions vs API Routes vs Edge Functions](#1-server-actions-vs-api-routes-vs-edge-functions)
2. [Mappa delle Server Actions](#2-mappa-delle-server-actions)
3. [createProject — Creazione sito](#3-createproject--creazione-sito)
4. [createPage — Creazione pagina manuale](#4-createpage--creazione-pagina-manuale)
5. [translatePage — Traduzione pagina](#5-translatepage--traduzione-pagina)
6. [generateProjectWithAI — Generazione con IA](#6-generateprojectwithia--generazione-con-ia)
7. [deployToCloudflare — Deploy](#7-deploytocloudflare--deploy)
8. [Edge Functions Supabase](#8-edge-functions-supabase)
9. [Sistema di Permessi e Piani](#9-sistema-di-permessi-e-piani)
10. [Storage Assets](#10-storage-assets)
11. [Limiti e Problemi Noti](#11-limiti-e-problemi-noti)
12. [File di Riferimento](#12-file-di-riferimento)

---

## 1. Server Actions vs API Routes vs Edge Functions

### Server Actions (Next.js)

Funzioni marcate con `'use server'` in cima al file. Vengono chiamate direttamente dai componenti client come normali funzioni TypeScript, ma girano **sul server**.

**Vantaggi:**
- Zero boilerplate HTTP: niente `fetch`, niente URL da gestire
- Accesso diretto a `createClient()` Supabase lato server (con cookie auth)
- Type-safe: il caller riceve il tipo di ritorno direttamente
- Sicure per default: il corpo della funzione non è mai esposto al client

**Quando usarle:** Mutazioni e operazioni privilegiate scatenate dall'utente (creare un progetto, tradurre una pagina, lanciare un deploy, generare con AI). È il pattern principale in questo progetto.

**Limite importante:** Next.js ha un limite di default sul corpo delle richieste HTTP alle Server Actions. Il limite è configurabile in `next.config.ts` con `serverActions.bodySizeLimit`. Se si inviano payload grandi (es. immagini base64, molti blocchi) si può incorrere in errori `413 Payload Too Large`.

> **Fix già applicato in passato**: la Server Action `generateProjectWithAI` inviava screenshot come URL (stringhe) invece che come base64 dal client — le immagini vengono fetchate e convertite in base64 direttamente sul server, aggirando il limite di payload.

### API Routes (Next.js)

File `app/api/[route]/route.ts` che espongono endpoint HTTP classici (`GET`, `POST`, ecc.).

**Quando usarle:** In questo progetto **non vengono usate**. Non esiste nessuna `app/api/`. Le Server Actions coprono tutti i casi d'uso attuali.

Se in futuro servissero webhook (es. da Stripe, da Cloudflare), o endpoint pubblici (es. preview da iframe esterni), andrebbero implementate come API Routes.

### Edge Functions (Supabase)

Funzioni Deno deployate su Supabase. Girano sull'infrastruttura Supabase, non su Vercel.

**Quando usarle:** Operazioni schedulate (cron), operazioni che richiedono `service_role` key (accesso admin al DB), o task in background non scatenati direttamente dall'utente.

**In questo progetto:** Solo `cleanup-storage` (vedi sezione 8).

---

## 2. Mappa delle Server Actions

Tutte le Server Actions sono in [`app/actions/`](../app/actions/).

| File | Funzione esportata | Scopo |
|---|---|---|
| `projects.ts` | `createProject` | Crea un nuovo sito (da template, da AI, da zero) |
| `pages.ts` | `createPage` | Crea una nuova pagina in una lingua |
| `pages.ts` | `translatePage` | Crea una traduzione di una pagina esistente |
| `deploy.ts` | `deployToCloudflare` | Genera HTML statico e deploya su Cloudflare Pages |
| `ai-generator.ts` | `generateProjectWithAI` | Genera un sito completo con Gemini AI |
| `ai-generator.ts` | `validateProjectDescription` | Valida la descrizione utente prima della generazione AI |

---

## 3. `createProject` — Creazione sito

**File:** [`app/actions/projects.ts`](../app/actions/projects.ts)

### Tre modalità di creazione sito

La stessa Server Action gestisce tutti e tre i percorsi:

| Modalità | Chi la chiama | Cosa passa |
|---|---|---|
| **Da zero (blank)** | `ProjectListClient` | `initialPages` con una HOME vuota (solo nav+footer) |
| **Da template** | `ProjectListClient` | `initialPages` con blocchi predefiniti del template |
| **Da AI** | `generateProjectWithAI` (internamente) | Inserisce direttamente su DB, non passa per `createProject` |

> La creazione via AI **non usa `createProject`**. `generateProjectWithAI` scrive direttamente su Supabase dopo aver generato tutto. Questo evita un round-trip client → server → DB con payload enorme.

### Flusso `createProject`

1. Verifica autenticazione (`auth.getUser()`)
2. Verifica limite piano `max_projects` via `canCreateProject()`
3. Inserisce il record in `projects` con `user_id` preso dal JWT (mai dal client)
4. Per ogni pagina in `initialPages`:
   - Estrae nav e footer dai blocchi
   - Inserisce i globals in `site_globals` (uno per lingua/tipo)
   - Inserisce le pagine in `pages` con i blocchi **senza** nav/footer
5. Restituisce `{ success: true, project }`

### Sicurezza

- `user_id` viene sempre preso dal JWT server-side, mai accettato dal client
- Verifica che il progetto non esista già (constraint DB su `subdomain`)

---

## 4. `createPage` — Creazione pagina manuale

**File:** [`app/actions/pages.ts`](../app/actions/pages.ts)

Crea una nuova pagina in una lingua specifica del progetto.

### Flusso

1. Verifica autenticazione
2. Verifica che l'utente sia proprietario del progetto (query su `projects`)
3. Verifica limite `max_pages_per_project`
4. Inserisce in `pages` con `language` esplicito

### Note

- `translations_group_id` non viene assegnato alla creazione — rimane `null` finché non si crea una traduzione via `translatePage`
- Non vengono creati globals: nav/footer devono già esistere per la lingua (creati al primo `createProject` o al primo `translatePage`)

---

## 5. `translatePage` — Traduzione pagina

**File:** [`app/actions/pages.ts`](../app/actions/pages.ts)

Crea una versione tradotta di una pagina già esistente, collegandole tramite `translations_group_id`.

### Flusso

1. Verifica autenticazione e ownership
2. Verifica limite `max_pages_per_project`
3. Carica la pagina sorgente
4. **Lazy assignment `translations_group_id`**: se la sorgente non ha ancora un UUID di gruppo, lo genera e lo salva sulla sorgente
5. Crea la nuova pagina nella lingua target con stesso `translations_group_id`, copiando `blocks` e `seo`
6. **Bootstrap globals**: se nella lingua target mancano nav o footer, li copia dalla lingua sorgente
7. Restituisce `{ success: true, page, sourceGroupId }` — il caller usa `sourceGroupId` per aggiornare la sorgente localmente senza refetch

### Limiti di sicurezza noti

- **`can_multilang` non verificato lato server**: la verifica è solo UI. Un utente senza piano potrebbe chiamare direttamente l'action. → Da aggiungere in futuro.

---

## 6. `generateProjectWithAI` — Generazione con IA

**File:** [`app/actions/ai-site-generator.ts`](../app/actions/ai-site-generator.ts) (wrapper) → [`lib/ai/site-generator.ts`](../lib/ai/site-generator.ts) (logica core)

La Server Action più complessa del progetto. Genera un sito completo a partire da dati del business usando Google Gemini.

### Input e costanti

```typescript
const PRIMARY_MODEL = 'gemini-3-flash-preview';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite-preview';
const MAX_DESCRIPTION_LENGTH = 5000;   // caratteri max descrizione
const MAX_EXTRA_PAGES = 10;            // pagine extra max
const MODEL_TIMEOUT = 360000;          // 6 minuti timeout per Gemini
const ALLOWED_DOMAINS = ['supabase.co', 'supabase.in']; // URL immagini ammessi
```

### Validazioni input (lato server)

- `businessName` obbligatorio
- `description` max `MAX_DESCRIPTION_LENGTH` caratteri
- `extraPages` max `MAX_EXTRA_PAGES` voci
- Screenshot e logo URL validati: devono avere hostname che termina con `supabase.co` o `supabase.in` (whitelist domini)

### Flusso completo

```
1. Validazione input
2. Auth check + canUseAI() + canCreateProject()
3. Lazy cleanup ai-temp (file > 30min → eliminati)
4. Costruzione prompt (system prompt + dati utente + logo/screenshot come base64)
5. Chiamata Gemini (PRIMARY_MODEL → retry su JSON error → FALLBACK_MODEL)
6. Validazione struttura output (settings + pages)
7. Determinazione colori (user override > AI da style reference > DEFAULT_COLORS_BY_TYPE)
8. Assemblaggio blocchi per ogni pagina (arricchimento con stili, sectionId, image URLs da Unsplash)
9. Post-assembly: risoluzione anchor links, validazione #anchor vs sectionId reali
10. Validazione immagini background (best-effort, non bloccante)
11. Move logo da ai-temp → cartella progetto (server-side, nessun round-trip client)
12. Cleanup screenshot ai-temp (fire & forget)
13. Salvataggio su DB: projects → site_globals → pages (senza nav/footer nei blocks)
14. increment_ai_usage via RPC
15. Return { success: true, projectId }
```

### Gestione immagini e payload

Le immagini (logo, screenshot di riferimento stile) vengono:
1. Caricate dal client in Supabase Storage nella cartella `{userId}/ai-temp/`
2. Passate come URL alla Server Action (non come base64 — evita payload enorme)
3. Fetchate e convertite in base64 **sul server** per passarle a Gemini come `inlineData`
4. Spostate dalla cartella `ai-temp` alla cartella definitiva `{userId}/{projectId}/` dopo la creazione

> Questo pattern risolve il problema del limite payload delle Server Actions. Passare immagini base64 direttamente dal form al server causerebbe errori `413`.

### Modelli AI e fallback

```
Tentativo 1: PRIMARY_MODEL (gemini-3-flash-preview)
  → Se JSON malformato: retry 1 volta sullo stesso modello
  → Se errore 429/503/500/403 o JSON ancora invalido: FALLBACK_MODEL
Tentativo 2: FALLBACK_MODEL (gemini-3.1-flash-lite-preview)
  → Se fallisce: throw → return { success: false, error }
```

### Colori deterministici per tipo business

Quando non è fornito un riferimento stile (screenshot/logo), i colori sono scelti in modo deterministico per categoria:

| Categoria | BG | Text | Accent |
|---|---|---|---|
| Restaurant | `#fdf6f0` | `#2d1b0e` | `#c0392b` |
| LocalBusiness | `#f8fafc` | `#1e293b` | `#2563eb` |
| HealthAndBeautyBusiness | `#fdf4f8` | `#3d1a2e` | `#c2185b` |
| Store | `#fafaf9` | `#1c1917` | `#d97706` |
| ... | | | |

Priorità colori: `user override > AI da style reference > DEFAULT_COLORS_BY_TYPE`

### Navigazione anchor vs multi-pagina

- Se `useAnchorNav = true`: single-page con `#anchor` links. La nav viene ricostruita deterministicamente dai `sectionId` reali dei blocchi presenti (max 6 link).
- Se `useAnchorNav = false` o multi-pagina: link standard `/slug`.
- Tutti gli anchor link (`ctaUrl`, `url`, `ctaUrl2`) vengono validati post-assembly contro i `sectionId` effettivi — quelli non validi vengono azzerati.

### Crediti AI

Al termine, viene chiamata la RPC `increment_ai_usage(p_user_id)` per scalare il credito mensile del piano.

---

## 7. `deployToCloudflare` — Deploy

**File:** [`app/actions/deploy.ts`](../app/actions/deploy.ts)

Genera l'HTML statico e deploya su Cloudflare Pages via Wrangler CLI.

### Flusso

```
1. Fetch pagine (order by created_at ASC)
2. Fetch project (verifica ownership)
3. Fetch site_globals (nav/footer per lingua)
4. ensureCloudflareProject() → crea il progetto Pages se non esiste
5. Genera HTML per ogni pagina via generateStaticHtml()
   → Rileva asset /assets/* referenziati
6. Genera sitemap.xml, robots.txt, _headers (mime types)
7. Download asset da Supabase Storage → cartella temp locale
8. Genera CSS Tailwind
   → Produzione (Vercel): binary standalone scaricato da GitHub releases
   → Locale: npx @tailwindcss/cli
9. Wrangler deploy via execSync
10. Parse URL dal output wrangler
11. Update project.live_url (solo al primo deploy) + last_published_at
12. syncCustomDomains() → aggiunge/rimuove domini custom su Cloudflare
13. cleanupOldDeployments() (mantiene max 5 deployment history)
14. Cleanup cartella temp
```

### Generazione CSS Tailwind

In produzione (Vercel serverless), il deploy non può usare `npx` perché il filesystem è read-only. La soluzione è scaricare il binary standalone di Tailwind CSS da GitHub e salvarlo in `/tmp`.

> **Attenzione**: il binary viene scaricato ad ogni cold start se non è già in `/tmp`. In ambienti con warm lambda questo è ok, ma se `/tmp` viene svuotato frequentemente può rallentare il primo deploy.

### Custom Domain

`syncCustomDomains()` è un'operazione di sincronizzazione bidirezionale:
- Aggiunge `domain` e `www.domain` se non presenti
- Rimuove domini extra che non corrispondono più alla configurazione

### Limitazioni

- `execSync` è bloccante — il deploy occupa un intero worker Vercel per tutta la durata (potenzialmente minuti)
- Wrangler viene eseguito da `/tmp` per aggirare il filesystem read-only di Vercel
- Non c'è gestione di concurrent deploy (due deploy simultanei potrebbero interferire)

---

## 8. Edge Functions Supabase

### `cleanup-storage`

**File:** [`supabase/functions/cleanup-storage/index.ts`](../supabase/functions/cleanup-storage/index.ts)

Funzione Deno schedulata settimanalmente (cron: `0 3 * * 1` — ogni lunedì alle 03:00 UTC).

**Usa `service_role` key** → accesso admin, bypassa RLS.

#### Cosa fa

1. **Pulizia asset orfani**: per ogni progetto, elenca i file in storage e rimuove quelli il cui nome non appare in nessun blocco/setting del progetto
2. **Pulizia ai-temp zombie**: rimuove i file in `ai-temp/` più vecchi di 1 ora

#### Deploy

```bash
supabase functions deploy cleanup-storage --no-verify-jwt
```

#### Scheduling via SQL (alternativa alla Dashboard)

```sql
select cron.schedule('cleanup-storage', '0 3 * * 1',
  $$select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/cleanup-storage',
    headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
  )$$
);
```

#### Limitazione nota

La ricerca asset orfani è basata su **substring matching del filename nel JSON serializzato** di pagine + settings. Se un filename coincidesse per caso con una stringa in un testo generico, il file non verrebbe eliminato (falso negativo — sicuro, non distruttivo).

---

## 9. Sistema di Permessi e Piani

**File:** [`lib/permissions.ts`](../lib/permissions.ts)

Tutti i check di piano passano per la RPC Supabase `get_user_limits(p_user_id)` che restituisce i limiti del piano corrente dell'utente.

### `UserLimits`

```typescript
interface UserLimits {
  plan_id: string;
  max_projects: number | null;          // null = illimitati
  max_pages_per_project: number | null; // null = illimitate
  max_storage_mb: number | null;
  max_ai_per_month: number | null;
  max_articles_per_project: number | null;
  can_custom_domain: boolean;
  can_custom_scripts: boolean;
  can_multilang: boolean;
  can_remove_branding: boolean;
  storage_used_bytes: number;
  ai_used_this_month: number;
}
```

### Funzioni helper

| Funzione | Verifica |
|---|---|
| `canCreateProject(userId)` | Conta progetti esistenti vs `max_projects` |
| `canCreatePage(userId, projectId)` | Conta pagine del progetto vs `max_pages_per_project` |
| `canUseAI(userId)` | `ai_used_this_month >= max_ai_per_month` |

### Check lato server vs lato UI

| Operazione | Lato server | Lato UI |
|---|---|---|
| Creare progetto | ✅ `canCreateProject()` | ✅ bottone disabilitato |
| Creare pagina | ✅ `canCreatePage()` | ✅ bottone disabilitato |
| Usare AI | ✅ `canUseAI()` | ✅ UI mostra contatore |
| Aggiungere lingua | ❌ non verificato | ✅ `canMultilang` in `LanguageSection` |
| Tradurre pagina | ❌ non verificato | ✅ pulsante non visibile |

> **Problema di sicurezza**: le operazioni multilang non hanno verifica server-side. Vedi sezione 11.

---

## 10. Storage Assets

### Struttura bucket `project-assets`

```
project-assets/
├── {userId}/
│   ├── {projectId}/
│   │   ├── img_abc123.jpg    → asset definitivi del progetto
│   │   └── logo_def456.png
│   └── ai-temp/
│       └── screenshot_xyz.png  → upload temporanei pre-generazione AI
```

### Lifecycle degli asset

1. **Upload pre-AI**: immagini caricate in `ai-temp/` dal client, usate come riferimento stile
2. **Move server-side**: dopo la generazione, il logo viene spostato in `{userId}/{projectId}/`
3. **Cleanup ai-temp**: file > 30 min rimossi all'inizio di ogni `generateProjectWithAI`
4. **Cleanup settimanale**: Edge Function `cleanup-storage` rimuove tutti gli asset orfani

### Risoluzione URL

- In editor: `resolveImageUrl(path, project, imageMemoryCache)` in [`lib/image-utils.ts`](../lib/image-utils.ts)
- In output statico: i path relativi `/assets/filename` vengono replicati nella struttura di deploy

---

## 11. Limiti e Problemi Noti

| Problema | Tipo | Dettaglio |
|---|---|---|
| **`can_multilang` non verificato server-side** | Sicurezza | `translatePage` e `createPage` in altre lingue non verificano il permesso. Un utente free potrebbe aggirare via chiamata diretta. → Aggiungere `getUserLimits()` check in `translatePage` |
| **Concurrent deploy non gestiti** | Stabilità | Due deploy sullo stesso progetto in parallelo potrebbero creare directory temp con lo stesso pattern e interferire |
| **Tailwind binary scaricato a runtime** | Performance | In produzione il binary (~10MB) viene scaricato da GitHub ad ogni cold start se `/tmp` è vuoto. Considerare includere il binary nel bundle |
| **`execSync` bloccante** | Scalabilità | Il deploy blocca un worker Vercel per tutta la durata (può essere 1-3 min). Non scala bene con molti utenti concorrenti |
| **Pulizia asset orfani non include `site_globals`** | Edge case | `cleanup-storage` cerca file referenziati in `pages.blocks` e `project.settings`, ma non in `site_globals.content`. Logo del footer potrebbero essere falsamente marcati come orfani |
| **`createPage` non crea globals** | UX | Se si aggiunge una lingua senza tradurre pagine, non vengono creati nav/footer per quella lingua. Risolto automaticamente al primo `translatePage`, ma rischioso se si crea una pagina in lingua X senza passare da `translatePage` |
| **Limite payload Server Actions** | Architettura | Risolto per `generateProjectWithAI`: le immagini vengono caricate su storage e passate come URL, non come base64. `createPage` passa `blocks: []` quindi nessun rischio. `createProject` passa template con soli blocchi testuali (ok). Pattern da ripetere se in futuro si aggiungono input pesanti: upload su storage → passa URL → fetch server-side. |
| **Wrangler eseguito da `/tmp`** | Manutenzione | Workaround per filesystem read-only di Vercel. Potrebbe rompersi su aggiornamenti di Vercel o Wrangler |

---

## 12. File di Riferimento

### Server Actions
- [`app/actions/projects.ts`](../app/actions/projects.ts) — `createProject`
- [`app/actions/pages.ts`](../app/actions/pages.ts) — `createPage`, `translatePage`
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — `deployToCloudflare`
- [`app/actions/ai-site-generator.ts`](../app/actions/ai-site-generator.ts) — `generateProjectWithAI`, `validateProjectDescription`
- [`app/actions/ai-blog.ts`](../app/actions/ai-blog.ts) — `improveTextWithAI`, `translateBlogPostWithAI`
- [`app/actions/ai-html-block.ts`](../app/actions/ai-html-block.ts) — `generateHtmlBlock`

### Edge Functions
- [`supabase/functions/cleanup-storage/index.ts`](../supabase/functions/cleanup-storage/index.ts) — pulizia asset orfani

### Permessi
- [`lib/permissions.ts`](../lib/permissions.ts) — `UserLimits`, `getUserLimits`, `canCreateProject`, `canCreatePage`, `canUseAI`
- [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) — SQL piani e RPC `get_user_limits`
- [`supabase/PIANI_E_PERMESSI.md`](../supabase/PIANI_E_PERMESSI.md) — documentazione piani

### Generazione
- [`lib/generate-static.tsx`](../lib/generate-static.tsx) — generazione HTML statico
- [`lib/ai/site-generator.ts`](../lib/ai/site-generator.ts) — logica core generazione sito
- [`lib/ai/image-pipeline.ts`](../lib/ai/image-pipeline.ts) — pipeline immagini AI
- [`lib/ai/prompts/site.ts`](../lib/ai/prompts/site.ts) — system prompt AI sito
- [`lib/ai/prompts/html-block.ts`](../lib/ai/prompts/html-block.ts) — prompt HTML block editor
- [`lib/ai/prompts/blog.ts`](../lib/ai/prompts/blog.ts) — prompt blog (migliora/traduci)
- [`lib/ai/gemini.ts`](../lib/ai/gemini.ts) — client Gemini condiviso
- [`lib/image-utils.ts`](../lib/image-utils.ts) — risoluzione URL asset

### Configurazione
- [`next.config.ts`](../next.config.ts) — configurazione Next.js (bodySizeLimit, ecc.)
