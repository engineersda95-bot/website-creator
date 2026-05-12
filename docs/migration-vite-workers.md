# Piano di Migrazione — Next.js → Vite SPA + Cloudflare Workers

> Documento di analisi e pianificazione per la migrazione tecnologica dell'editor da Next.js a Vite React SPA, con backend su Cloudflare Workers e autenticazione OIDC.

**Data:** Aprile 2026  
**Stato:** Proposta — pre-implementazione

---

## Indice

1. [Obiettivo e motivazioni](#1-obiettivo-e-motivazioni)
2. [Stack target](#2-stack-target)
3. [Architettura target](#3-architettura-target)
4. [Analisi impatti per area](#4-analisi-impatti-per-area)
5. [Autenticazione: da Supabase Auth a OIDC](#5-autenticazione-da-supabase-auth-a-oidc)
6. [Database Supabase senza Auth](#6-database-supabase-senza-auth)
7. [Backend: da Server Actions a Cloudflare Workers](#7-backend-da-server-actions-a-cloudflare-workers)
8. [Deploy dei siti — Incrementale via Direct Upload API](#8-deploy-dei-siti--incrementale-via-direct-upload-api)
9. [Frontend: da Next.js a Vite SPA](#9-frontend-da-nextjs-a-vite-spa)
10. [Prezzi verificati](#10-prezzi-verificati)
11. [Punti di azione prioritizzati](#11-punti-di-azione-prioritizzati)
12. [Matrice dei rischi](#12-matrice-dei-rischi)
13. [Stima effort](#13-stima-effort)

---

## 1. Obiettivo e motivazioni

### Situazione attuale

L'editor gira su **Next.js + Vercel**, con:
- Server Actions per tutta la logica backend (CRUD, deploy, AI)
- Supabase per auth (cookie-based via `@supabase/ssr`) + DB PostgreSQL
- Cloudflare Pages per i siti pubblicati (output statico)
- Un'unica codebase che mescola server e client

### Target

| Layer | Ora | Dopo |
|---|---|---|
| Frontend | Next.js (SSR + SA) | Vite 7 + React 19 (SPA pura) |
| Backend | Next.js Server Actions (Vercel) | Cloudflare Workers (TypeScript) |
| Auth | Supabase Auth (password-based) | OIDC (provider esterno) |
| Database | Supabase PostgreSQL | Supabase PostgreSQL (invariato) |
| Hosting SPA | Vercel | Cloudflare Pages (gratis) |
| Siti pubblicati | Cloudflare Pages | Cloudflare Pages (invariato) |

### Perché ha senso

- **Eliminare Vercel** — prezzi poco trasparenti, tutto si sposta su Cloudflare con costi chiari
- **Separazione dei concern** — frontend puro (SPA) e backend puro (Worker), deployabili indipendentemente
- **OIDC flessibile** — qualsiasi identity provider, senza dipendere da Supabase Auth
- **Struttura allineata al blueprint** — la SPA seguirà la struttura del `PROJECT_BLUEPRINT.md` già definita
- **Costo MVP** — CF Pages gratis + Workers free tier probabilmente sufficiente

---

## 2. Stack target

### Frontend (Vite SPA)

| Layer | Tecnologia |
|---|---|
| Runtime | React 19 |
| Language | TypeScript 5 (strict) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (plugin vite, NO PostCSS) |
| UI Components | shadcn/ui + Radix UI |
| Routing | React Router v7 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form v7 + Zod v4 |
| HTTP | Axios |
| Icons | lucide-react |
| Toasts | Sonner |
| State editor | Zustand v5 (invariato) |
| Rich text | TipTap v3 (invariato) |
| Auth client | `react-oidc-context` + `oidc-client-ts` |
| Package manager | pnpm |

### Backend (Cloudflare Workers)

| Layer | Tecnologia |
|---|---|
| Runtime | Cloudflare Workers (V8 isolates) |
| Language | TypeScript |
| Framework routing | Hono |
| DB Client | `@supabase/supabase-js` con `service_role` key |
| AI | `@google/genai` (invariato) |
| Deploy siti | Cloudflare Pages Direct Upload API (sostituisce Wrangler CLI) |
| Storage | Supabase Storage (invariato) |
| Image WebP | Rimosso per MVP — immagini AI salvate in JPEG direttamente |

---

## 3. Architettura target

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│                                                               │
│  Vite SPA (Cloudflare Pages — gratis)                         │
│  ├── react-oidc-context  ──────►  Identity Provider (OIDC)   │
│  └── Axios + React Query ──────►  Cloudflare Worker (API)    │
│                                         │                     │
└─────────────────────────────────────────│─────────────────────┘
                                          │
                             ┌────────────▼──────────────┐
                             │  Cloudflare Worker (Hono) │
                             │                           │
                             │  - Verifica JWT OIDC      │
                             │  - CRUD projects/pages    │
                             │  - AI generation          │
                             │  - Deploy via Direct API  │
                             │  - Supabase Storage       │
                             └────────────┬──────────────┘
                                          │
                             ┌────────────▼──────────────┐
                             │  Supabase PostgreSQL       │
                             │  (DB only, no Auth)        │
                             └───────────────────────────┘
```

---

## 4. Analisi impatti per area

### 4.1 Routing e navigazione

| Ora (Next.js) | Dopo (React Router v7) | Impatto |
|---|---|---|
| `app/editor/page.tsx` | `pages/EditorListPage/` | Medio |
| `app/editor/[projectId]/page.tsx` | `pages/ProjectDashboardPage/` | Medio |
| `app/editor/[projectId]/[pageId]/page.tsx` | `pages/EditorPage/` | Medio |
| `app/editor/[projectId]/blog/[postId]/page.tsx` | `pages/BlogPostEditorPage/` | Medio |
| `app/login/page.tsx` | `pages/LoginPage/` — solo redirect OIDC | Basso |
| `app/blog/` | Portare su CF Pages come sito statico separato quando si spegne Vercel | Basso |

> Il pattern `page.tsx` server + `*Client.tsx` client **scompare**: tutto diventa client, i dati si caricano via React Query.

### 4.2 Server Actions → REST endpoints (Worker)

Ogni Server Action diventa un endpoint HTTP nel Worker:

| Server Action | Endpoint Worker (Hono) | Metodo |
|---|---|---|
| `createProject()` | `POST /projects` | POST |
| `updateProject()` | `PATCH /projects/:id` | PATCH |
| `deleteProject()` | `DELETE /projects/:id` | DELETE |
| `createPage()` | `POST /projects/:id/pages` | POST |
| `updatePage()` | `PATCH /pages/:id` | PATCH |
| `deletePage()` | `DELETE /pages/:id` | DELETE |
| `translatePage()` | `POST /pages/:id/translate` | POST |
| `deployToCloudflare()` | `POST /projects/:id/deploy` | POST |
| `generateProjectWithAI()` | `POST /projects/generate-ai` | POST |
| `improveTextWithAI()` | `POST /ai/improve-text` | POST |
| `translateBlogPostWithAI()` | `POST /ai/translate-blog` | POST |
| `generateHtmlBlock()` | `POST /ai/html-block` | POST |
| `POST /api/generate-image` | `POST /ai/generate-image` | POST |

### 4.3 OG Image generation

`app/api/og/route.tsx` usa `@vercel/og` (proprietario Vercel).

**Soluzione:** riscrivere con `satori` + `resvg-wasm` — è la stessa libreria open source che sta sotto `@vercel/og`. Porting documentato per Workers, è una singola rotta isolata.

### 4.4 `sharp` — dove è usato e cosa fare

`sharp` è usato **solo** in `lib/ai/image-pipeline.ts`: converte in WebP le immagini generate da AI (Google Imagen) prima di salvarle su Supabase Storage.

Non è usato nel deploy né nell'upload manuale utente.

**Soluzione MVP:** rimuovere la conversione, salvare il JPEG direttamente. Le immagini AI escono già compresse, la differenza visiva è trascurabile. Si può aggiungere la conversione WebP in un secondo momento tramite Cloudflare Images API se necessario.

### 4.5 Supabase Edge Function (cleanup-storage)

Rimane su Supabase invariata. È un cron job Deno che pulisce asset orfani — nessun impatto sulla migrazione.

### 4.6 Blog di marketing (`app/blog/`)

È nella stessa codebase Next.js. Quando si spegne Vercel va portato altrove. Essendo contenuto statico, si esporta come HTML e si carica su CF Pages come progetto separato. Non è urgente e non blocca nulla.

---

## 5. Autenticazione: da Supabase Auth a OIDC

### Come funziona adesso

```
Browser → POST /login → Supabase Auth (email+password)
                      ← httpOnly cookie (JWT Supabase)
Next.js middleware → legge cookie → verifica sessione → protegge route
Server Action → supabase.auth.getUser() → identità utente
```

### Come funzionerà

```
Browser → redirect → Identity Provider OIDC (login form)
        ← redirect con code → SPA scambia code per access_token + id_token
SPA → Axios interceptor → Authorization: Bearer <access_token>
Worker → verifica JWT (firma, issuer, audience, scadenza)
       → estrae sub (user_id) dal JWT
       → filtra sempre per user_id da JWT (mai dal body della request)
```

### Librerie client

```
react-oidc-context    // wrapper React per oidc-client-ts
oidc-client-ts        // OIDC/OAuth2 client — gestisce silent refresh automatico
```

### Configurazione (come da PROJECT_BLUEPRINT)

```typescript
// src/config/auth.config.ts
export const oidcConfig = {
  authority: import.meta.env.VITE_REACT_APP_AUTHORITY,
  client_id: import.meta.env.VITE_REACT_APP_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REACT_APP_REDIRECT_URL,
  response_type: 'code',
  scope: import.meta.env.VITE_REACT_APP_SCOPE,
  automaticSilentRenew: true,
  silent_redirect_uri: `${import.meta.env.VITE_REACT_APP_REDIRECT_URL}/silent-refresh.html`,
  onSigninCallback: () => window.history.replaceState({}, '', window.location.pathname),
};
```

### Verifica JWT nel Worker

```typescript
// worker/src/middleware/auth.ts
export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const payload = await verifyJwt(token, {
    issuer: env.OIDC_ISSUER,
    audience: env.OIDC_CLIENT_ID,
  });

  c.set('userId', payload.sub);
  await next();
};
```

### Provider OIDC consigliati

| Provider | Adatto per | Note |
|---|---|---|
| **Auth0** | MVP rapido | Piano free generoso, setup 30 minuti |
| **Azure AD / Entra ID** | Tenant Microsoft | Già citato nel blueprint |
| **Keycloak** | Self-hosted | Richiede server dedicato |

### Migrazione user_id

Gli `user_id` nel DB sono oggi UUID di Supabase Auth. Al momento della migrazione:

**Opzione consigliata:** creare gli utenti sul provider OIDC configurando il claim `sub` con lo stesso UUID Supabase — zero migration SQL, zero modifiche al DB.

---

## 6. Database Supabase senza Auth

**Sì, si può usare Supabase DB senza Supabase Auth.** Sono servizi separati e indipendenti.

### Strategia: Service Role key nel Worker

Il Worker usa la `service_role` key che bypassa RLS. La sicurezza è garantita dal Worker:

1. Verifica JWT OIDC
2. Estrae `user_id` dal token (claim `sub`)
3. Aggiunge `WHERE user_id = $verified_user_id` a ogni query — mai dal body della request

```typescript
const userId = c.get('userId'); // da authMiddleware, non dal client
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

### Cosa rimane invariato

- Schema PostgreSQL — nessuna modifica
- Supabase Storage — invariato
- Tutte le tabelle custom (`projects`, `pages`, ecc.)

---

## 7. Backend: da Server Actions a Cloudflare Workers

### Perché Workers e non Node.js

Workers gira su **V8 isolate** (stesso engine del browser), non Node.js. Questo significa:
- Cold start ~0ms invece di 100-500ms di Lambda/Cloud Functions
- `child_process`, `fs`, librerie native C++ (come `sharp`) non disponibili
- Tutto il resto TypeScript funziona normalmente

### CPU time — chiarimento importante

Il CPU time di Workers conta **solo il JavaScript attivo**, non il tempo di attesa per fetch esterne. Fonte: documentazione ufficiale Cloudflare.

```
Worker chiama fetch() verso Supabase → attende 200ms → riceve risposta
→ quei 200ms NON contano come CPU time
```

Il deploy è quasi interamente I/O (fetch Supabase, download asset, chiamate CF API) — il JavaScript attivo è pochi ms. **Il piano free (10ms CPU) è probabilmente sufficiente** anche per il deploy. Da verificare empiricamente sul primo sito reale.

### Struttura progetto Worker

```
worker/
├── src/
│   ├── index.ts              # Entry point Hono + routing
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   └── cors.ts
│   ├── routes/
│   │   ├── projects.ts
│   │   ├── pages.ts
│   │   ├── deploy.ts
│   │   └── ai.ts
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── deploy.ts         # Direct Upload API (ex Wrangler CLI)
│   │   ├── ai-generator.ts
│   │   └── static-generator.ts
│   └── types/
│       └── env.ts
├── wrangler.toml
└── package.json
```

---

## 8. Deploy dei siti — Incrementale via Direct Upload API

### Perché incrementale da subito

Il deploy incrementale risolve tutti i problemi in un colpo:
- **Niente Wrangler CLI** — l'upload diventa `fetch()` puro, gira su Workers
- **Niente timeout** — si caricano solo i file cambiati, il deploy di una pagina dura secondi
- **Niente `child_process`** — zero dipendenze Node.js

### Prerequisiti DB (migration minimale)

Aggiungere due colonne a `projects`:

| Colonna | Scopo |
|---|---|
| `settings_updated_at` | Aggiornato ogni volta che l'utente salva le impostazioni progetto |
| `settings_last_published_at` | Aggiornato ad ogni deploy completato |

`site_globals` ha già `updated_at`. `pages` ha già `updated_at`. `projects` ha già `last_published_at`.

### Logica incrementale

```
1. se project.settings_updated_at > project.settings_last_published_at
   → CSS cambiato (tema, font, settings) → rigenera styles.css + TUTTE le pagine

2. per ogni lingua:
   se site_globals[lingua].updated_at > project.last_published_at
   → nav/footer cambiati → rigenera tutte le pagine di quella lingua

3. altrimenti
   → rigenera solo le pagine con updated_at > project.last_published_at
```

Al primo deploy (o se `settings_last_published_at` è null) rigenera tutto per sicurezza.

### Flusso Direct Upload API

La Direct Upload API di CF Pages fa deduplicazione automatica via hash — file invariati vengono saltati automaticamente.

```
1. GET /accounts/:id/pages/projects/:name/upload-token
   → JWT temporaneo per l'upload

2. Calcola SHA256 di ogni file da caricare (HTML pagine, styles.css, font)

3. POST /pages/assets/check-missing { hashes: [...] }
   → CF risponde con la lista degli hash che non ha ancora

4. POST /pages/assets/upload
   → solo i file mancanti, in batch, contenuto base64

5. POST /pages/assets/upsert-hashes

6. POST /accounts/:id/pages/projects/:name/deployments
   { manifest: { "/index.html": "hash", "/about.html": "hash", ... } }
   → deployment pubblicato
```

Tutto `fetch()` puro — funziona su Workers senza Wrangler, senza Node.js. Il codice sorgente di Wrangler è il riferimento diretto per implementare questa logica (~150 righe).

### Tailwind CSS — API JS pura

Tailwind 4 espone `compile()` verificato nel codice sorgente ufficiale:

```typescript
import { compile } from 'tailwindcss';

const result = compile('@import "tailwindcss";');
const css = result.build(htmlCandidates); // ritorna CSS stringa
```

Zero binary, zero CLI. Funziona su Workers.

### Asset (immagini)

Le immagini **non vanno nel bundle CF Pages** — restano su Supabase Storage, referenziate con URL assoluti nell'HTML. Nel bundle Pages vanno solo HTML, CSS e font. Abbondantemente sotto i limiti.

### Deploy asincrono

Il Worker risponde subito `202 Accepted` e continua il deploy in background con `waitUntil()`. La SPA fa polling con `refetchInterval` condizionale (pattern §10 del PROJECT_BLUEPRINT).

```
SPA → POST /projects/:id/deploy
Worker → risponde subito { status: "deploying" }
       → continua in background (waitUntil)
       → aggiorna DB a "live" / "error" quando finisce

SPA → polling ogni 5s → vede status → smette di pollare
```

---

## 9. Frontend: da Next.js a Vite SPA

### Struttura cartelle (da PROJECT_BLUEPRINT)

```
src/
├── main.tsx
├── App.tsx                    # OidcProvider + QueryClientProvider + BrowserRouter
├── index.css
│
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── custom/
│   └── layout/
│       ├── AppRoutes.tsx
│       ├── Layout.tsx
│       └── PermissionGuard.tsx
│
├── pages/
│   ├── LoginPage/             # Solo redirect OIDC, niente form email/password
│   ├── EditorListPage/        # ex ProjectListClient.tsx
│   ├── ProjectDashboardPage/  # ex ProjectDashboardClient.tsx
│   ├── EditorPage/            # ex EditorClient.tsx
│   └── BlogPostEditorPage/    # ex BlogPostEditorClient.tsx
│
├── hooks/
│   ├── useAuth.ts             # Wrapper useAuth da react-oidc-context
│   └── useURLState.ts
│
├── services/
│   ├── api/
│   │   ├── api.service.ts     # Axios → Worker base URL
│   │   └── token-refresh.ts   # Silent refresh OIDC su 401
│   ├── projects/
│   ├── pages/
│   └── ai/
│
└── config/
    └── auth.config.ts
```

### Cosa NON cambia (si porta as-is)

Circa il 60% del frontend è già client-only:

- `components/blocks/visual/*` — tutti i blocchi visuali
- `components/blocks/sidebar/*` — tutti gli editor sidebar
- `components/blocks/BlockRegistry.tsx`, `EditorCanvas.tsx`, `BlockSidebar.tsx`, `ConfigSidebar.tsx`
- `components/editor/*` — header, wrapper, modali
- `components/shared/*` — InlineEditable, SitiImage, CTA, ecc.
- `store/useEditorStore.ts` — Zustand store, invariato
- `lib/block-definitions.ts`, `lib/utils.ts`, `lib/base-style-mapper.ts`, `lib/hooks/`
- `types/*` — tutti i tipi TypeScript
- `lib/background-patterns.ts`, `lib/templates.ts`, ecc.

### Cosa cambia

| File attuale | Azione |
|---|---|
| `app/editor/page.tsx` + `ProjectListClient.tsx` | → `pages/EditorListPage/` con React Query |
| `app/editor/[projectId]/` + `ProjectDashboardClient.tsx` | → `pages/ProjectDashboardPage/` con React Query |
| `app/editor/[projectId]/[pageId]/EditorClient.tsx` | → `pages/EditorPage/` (logica invariata) |
| `app/editor/[projectId]/blog/[postId]/BlogPostEditorClient.tsx` | → `pages/BlogPostEditorPage/` |
| `app/login/` | → `pages/LoginPage/` (solo OIDC redirect) |
| Modali con chiamate SA | Porta chiamate a `POST /ai/*` via Axios |
| `lib/permissions.ts` | → `GET /me/limits` nel Worker |
| `app/api/og/route.tsx` | → Worker con `satori` + `resvg-wasm` |
| `app/blog/` | Esportare come HTML statico su CF Pages separato quando si spegne Vercel |

---

## 10. Prezzi verificati

Dati dalla documentazione ufficiale Cloudflare (Aprile 2026).

### Cloudflare Pages

| | Free |
|---|---|
| Progetti | 100 (soft limit, aumentabile su richiesta) |
| Build al mese | 500 |
| File per deploy | 20.000 |
| Dimensione singolo file | 25 MB |
| Custom domain | 100 |
| Hosting SPA | **Gratis** |

> I siti degli utenti vengono deployati tramite Direct Upload API — da verificare se conta nel limite delle 500 build mensili (probabilmente no, le build sono i deploy CI/CD con build server).

### Cloudflare Workers

| | Free | Paid ($5/mese fissi) |
|---|---|---|
| Request/giorno | 100.000 | 10M/mese inclusi + $0.30/M extra |
| CPU time | 10ms/invocazione | 30s default, 5 min max |
| CPU time mensile | — | 30M ms inclusi + $0.02/M extra |

**CPU time chiarimento:** conta solo JavaScript attivo, NON il tempo di attesa per fetch esterne. Il deploy è quasi tutto I/O — il piano free è probabilmente sufficiente.

### Cloudflare R2 (se si migra lo storage)

| | Free | Oltre |
|---|---|---|
| Storage | 10 GB/mese | $0.015/GB |
| Egress | **Gratis sempre** | Gratis sempre |
| Operazioni Class A | 1M/mese | $4.50/M |
| Operazioni Class B | 10M/mese | $0.36/M |

### Quadro economico MVP

| Servizio | Costo |
|---|---|
| Vercel | **Eliminato** |
| CF Pages (SPA editor) | Gratis |
| CF Workers | Gratis (free tier) — $5/mese se necessario |
| Supabase DB + Storage | Piano attuale invariato |
| Provider OIDC (Auth0 free) | Gratis |
| **Totale aggiuntivo** | **$0** |

---

## 11. Punti di azione prioritizzati

### Fase 0 — Preparazione (1-2 giorni)

- [ ] Scegliere provider OIDC (Auth0 free tier consigliato per MVP)
- [ ] Creare utenti sul provider OIDC con `sub` = UUID Supabase esistenti
- [ ] Creare il progetto Worker (`worker/` separato nel repo o repo indipendente)

### Fase 1 — Backend Worker (1-2 settimane)

- [ ] Setup `wrangler.toml` + Hono + TypeScript
- [ ] Middleware auth JWT (verifica JWKS del provider)
- [ ] Portare CRUD progetti/pagine/globals
- [ ] Implementare deploy via Direct Upload API CF Pages (ex `execSync wrangler`)
- [ ] Risolvere Tailwind CLI — usare API JS invece del binary
- [ ] Portare azioni AI (rimuovere `sharp`, salvare JPEG direttamente)
- [ ] Portare `POST /api/generate-image`
- [ ] Riscrivere `GET /api/og` con `satori` + `resvg-wasm`
- [ ] Test endpoint

### Fase 2 — Frontend Vite (1-2 settimane)

- [ ] Scaffold Vite + React 19 + TypeScript strict
- [ ] Setup Tailwind 4, shadcn/ui, React Router v7, React Query
- [ ] Configurare `react-oidc-context`
- [ ] Axios con interceptor Bearer token + silent refresh su 401
- [ ] Copiare `components/blocks/`, `components/editor/`, `components/shared/`
- [ ] Copiare `store/`, `lib/`, `types/`
- [ ] Scrivere `pages/EditorListPage/` + hook React Query
- [ ] Scrivere `pages/ProjectDashboardPage/`
- [ ] Portare `EditorClient.tsx` → `pages/EditorPage/`
- [ ] Portare `BlogPostEditorClient.tsx` → `pages/BlogPostEditorPage/`
- [ ] `pages/LoginPage/` con OIDC redirect
- [ ] Portare chiamate SA → endpoint Worker via Axios
- [ ] `GET /me/limits` al posto di `lib/permissions.ts`

### Fase 3 — Deploy e test (2-3 giorni)

- [ ] Deploy Worker su Cloudflare Workers
- [ ] Deploy SPA su Cloudflare Pages
- [ ] Test E2E: login → crea progetto → editor → deploy sito
- [ ] Verificare CPU time reale del deploy su Worker free
- [ ] Migrazione DNS
- [ ] Esportare `app/blog/` su CF Pages separato
- [ ] Spegnere Vercel

---

## 12. Matrice dei rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| CPU time deploy supera 10ms free tier | Media | Basso | $5/mese Workers paid — misurare prima |
| `execSync wrangler` non disponibile su Workers | **Certezza** | Alto | Direct Upload API CF Pages — soluzione chiara |
| Tailwind CLI binary non eseguibile su Workers | **Certezza** | Medio | API JS Tailwind 4 o pre-generazione al build |
| `sharp` non disponibile su Workers | **Certezza** | Basso | Rimuovere conversione WebP per MVP, salvare JPEG |
| `@vercel/og` non portabile | **Certezza** | Basso | `satori` + `resvg-wasm` — porting documentato |
| user_id mismatch dopo migrazione auth | Bassa | Critico | Creare utenti OIDC con sub = UUID Supabase esistente |
| Deploy siti supera limite file 20.000 | Molto bassa | Medio | Immagini su Supabase Storage, non nel bundle |

---

## 13. Stima effort

| Fase | Effort stimato |
|---|---|
| Fase 0 — Preparazione | 1-2 giorni |
| Fase 1 — Worker backend | 7-10 giorni |
| Fase 2 — Frontend Vite | 7-10 giorni |
| Fase 3 — Deploy e test | 2-3 giorni |
| **Totale** | **~4-5 settimane** (sviluppatore singolo full-time) |

### Migrazione incrementale (opzione conservativa)

È possibile una strategia **strangler fig**:

1. Mantieni Next.js attivo
2. Deploya il Worker e porta le nuove chiamate API su di esso
3. Migra le pagine una a una sulla SPA Vite
4. Quando tutto è migrato, spegni Vercel

Prolunga i tempi a ~6-8 settimane per via della doppia manutenzione, ma riduce il rischio di interruzioni.
