# Infrastruttura — Deploy, Hosting, Storage

> Come il sito viene pubblicato e servito all'utente finale.

---

## Panoramica architettura

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Editor      │      │   Deploy      │      │  Sito live    │
│   (Next.js)   │ ──▶  │  (Server      │ ──▶  │  (HTML statico│
│   Client +    │      │   Action)     │      │   su Cloudflare│
│   Supabase    │      │              │      │   Pages)      │
└──────────────┘      └──────────────┘      └──────────────┘
```

L'editor e un'app Next.js con Supabase. Il deploy genera HTML statico puro (zero React runtime, zero Node.js) e lo carica su Cloudflare Pages. Il sito pubblicato non ha dipendenze server — e solo HTML + CSS + vanilla JS minimale.

---

## Pipeline di deploy

Quando l'utente clicca "Pubblica", parte una Server Action (`app/actions/deploy.ts`) che esegue questi step:

### Step 1 — Fetch dati

- Tutte le pagine del progetto da `pages`
- Metadati progetto da `projects` (subdomain, settings, user_id)
- Blocchi globali (nav/footer per lingua) da `site_globals`

### Step 2 — Verifica progetto Cloudflare

- `GET /accounts/{id}/pages/projects/{name}` — controlla se esiste
- Se 404: `POST` per creare il progetto con `production_branch: 'main'`
- Alla prima pubblicazione salva `live_url` nel DB

### Step 3 — Genera HTML statico

Per ogni pagina chiama `generateStaticHtml()` (vedi doc `static-generation.md` per i dettagli).

File generati (pagine):
- `index.html` (pagina home)
- `{slug}.html` (altre pagine)
- `{lingua}/index.html` (home in altre lingue)
- `{lingua}/{slug}.html` (pagine in altre lingue)

### Step 3.1 — Genera pagine blog

Se il progetto ha articoli pubblicati (`blog_posts` con `status = 'published'`), per ogni lingua attiva:

1. **Listing** — `generateBlogListingHtml()` → `blog/index.html` (o `{lingua}/blog/index.html`)
   - Se esiste già una pagina con `slug = 'blog'`, la listing è quella pagina (generata dal normale `generateStaticHtml`)
   - Altrimenti viene generata la listing standalone
2. **Post** — `generateBlogPostHtml()` → `blog/{slug}.html` per ogni articolo della lingua
   - Nav e footer iniettati da `siteGlobals` (stesso meccanismo delle pagine normali)
   - Corpo articolo: HTML da TipTap o Markdown legacy (rilevamento automatico)
   - Articoli correlati per categoria (max 3) in coda all'articolo

File generati (blog):
- `blog/index.html`
- `blog/{slug}.html` (per ogni articolo)
- `{lingua}/blog/index.html` (per lingue non default)
- `{lingua}/blog/{slug}.html`

### Step 4 — Genera sitemap, robots.txt, _headers

- **sitemap.xml** — URL di tutte le pagine con `hreflang` per le varianti lingua e `x-default`
- **robots.txt** — Disallow per pagine con `indexable: false`, punta al sitemap
- **_headers** — MIME types per Cloudflare (`Content-Type: application/xml` per sitemap)

### Step 5 — Scarica asset da Supabase

- Scansiona tutto l'HTML generato con regex: `/\/assets\/([^"\s?]+)/g`
- Deduplica i filename in un Set
- Per ogni asset scarica da Supabase Storage: `project-assets/{userId}/{projectId}/{filename}`
- Salva in `{tempDir}/assets/`

### Step 6 — Genera CSS con Tailwind

L'HTML generato usa classi Tailwind. Il CSS viene compilato on-demand:

- **In produzione (Vercel):** scarica il binary standalone di Tailwind CSS v4 in `/tmp/` e lo esegue
- **In locale:** usa `npx @tailwindcss/cli`
- Input: scansiona tutti i file `.html` nella temp dir
- Output: `/assets/styles.css` minificato
- Fallback: CSS vuoto se la compilazione fallisce

### Step 7 — Deploy su Cloudflare Pages

```bash
npx wrangler@3 pages deploy "{tempDir}" \
  --project-name="{subdomain}" \
  --branch="main"
```

Wrangler fa direct upload (non build da Git). Carica tutti i file e restituisce l'URL del deployment.

L'URL viene pulito: se wrangler restituisce `hash.subdomain.pages.dev`, rimuoviamo l'hash per ottenere `subdomain.pages.dev`.

### Step 8 — Sync domini custom

Se il progetto ha un dominio custom:
- `GET .../domains` per vedere i domini attuali
- `POST` per aggiungere domini mancanti (incluso il `www.`)
- `DELETE` per rimuovere domini non piu configurati

### Step 9 — Cleanup

- Aggiorna `last_published_at` e `live_url` nel DB
- Elimina la temp directory
- Async: rimuove i deploy vecchi (tiene solo gli ultimi 5)

---

## Cloudflare

### Configurazione

- **Servizio:** Cloudflare Pages (free tier: 500 build/mese, bandwidth illimitato)
- **Deploy:** Direct upload via Wrangler CLI (non build da Git)
- **URL:** `https://{subdomain}.pages.dev`
- **Domini custom:** API Cloudflare per aggiungere/rimuovere domini (incluso www)
- **SSL:** Automatico (Cloudflare gestisce i certificati)
- **CDN:** Automatico (edge caching globale)

### API endpoints usati

```
Base: https://api.cloudflare.com/client/v4
Auth: Bearer {CLOUDFLARE_API_TOKEN}

GET    /accounts/{id}/pages/projects/{name}              — verifica esistenza
POST   /accounts/{id}/pages/projects                      — crea progetto
GET    /accounts/{id}/pages/projects/{name}/domains       — lista domini
POST   /accounts/{id}/pages/projects/{name}/domains       — aggiungi dominio
DELETE /accounts/{id}/pages/projects/{name}/domains/{dom}  — rimuovi dominio
GET    /accounts/{id}/pages/projects/{name}/deployments   — lista deploy
DELETE /accounts/{id}/pages/projects/{name}/deployments/{id} — elimina deploy
```

### Variabili d'ambiente

```
CLOUDFLARE_ACCOUNT_ID    — ID account Cloudflare
CLOUDFLARE_API_TOKEN     — Token API con permessi Pages
```

### Routing

Cloudflare Pages gestisce il routing automaticamente:
- `/{slug}` → serve `/{slug}.html`
- `/{lingua}/{slug}` → serve `/{lingua}/{slug}.html`
- `/` → serve `/index.html`

### Struttura file deployato

```
/
├── index.html                    ← home (lingua default)
├── about.html                    ← pagina about
├── contatti.html                 ← pagina contatti
├── en/
│   ├── index.html                ← home inglese
│   └── about.html                ← about inglese
├── assets/
│   ├── styles.css                ← Tailwind compilato
│   ├── img_a1b2c3.webp           ← immagini ottimizzate
│   └── img_d4e5f6.webp
├── sitemap.xml
├── robots.txt
└── _headers                      ← MIME types per Cloudflare
```

### Cleanup deploy

Dopo ogni deploy, async elimina i deployment vecchi tenendo solo gli ultimi 5. Evita accumulo su Cloudflare.

---

## Pipeline immagini

### In editor

1. Utente carica immagine
2. Client ottimizza: canvas → WebP, max 2400px, qualita progressiva (0.82 → 0.5) fino a <1.8MB
3. Upload su Supabase Storage: `project-assets/{userId}/{projectId}/img_{sha256}.webp`
4. Salva nel blocco come path relativo: `/assets/img_{hash}.webp`
5. In editor, risolve via Supabase public URL per la preview

### In deploy

1. Scansiona HTML per `/assets/{filename}`
2. Scarica da Supabase: `project-assets/{userId}/{projectId}/{filename}`
3. Salva in temp dir: `assets/{filename}`
4. Wrangler carica tutto su Cloudflare Pages
5. Sito live serve da: `https://{subdomain}.pages.dev/assets/{filename}`

### Preload LCP

Il primo image above-fold viene preloadato nell'`<head>`:

```html
<link rel="preload" as="image" href="/assets/hero-bg.webp" fetchpriority="high">
```

Priorita: hero background > primo item promo > prima image-text.

---

## Supabase — Panoramica

Per lo schema completo del database vedi `database.md`.

### Tabelle usate nel deploy

- **projects** — subdomain, settings, user_id, live_url
- **pages** — slug, lingua, blocchi JSON, SEO
- **site_globals** — nav/footer per lingua

### Storage

Bucket: `project-assets`

Struttura: `{userId}/{projectId}/{filename}` per asset, `ai-temp/{userId}/{filename}` per temporanei AI.

### Edge Functions

**cleanup-storage** — Cron settimanale. Elimina file orfani non referenziati in nessun blocco. Pulisce `ai-temp/` (file >1 ora).

---

## Flusso completo

```
UTENTE CLICCA "PUBBLICA"
       ↓
Fetch pagine + globals + progetto da Supabase
       ↓
Verifica/crea progetto su Cloudflare API
       ↓
Per ogni pagina:
  generateStaticHtml() → HTML completo
       ↓
Genera sitemap.xml + robots.txt + _headers
       ↓
Scansiona HTML per /assets/*, scarica da Supabase Storage
       ↓
Compila Tailwind CSS (binary o npx) → styles.css
       ↓
wrangler pages deploy → upload su Cloudflare Pages
       ↓
Sync domini custom via API Cloudflare
       ↓
Aggiorna live_url e last_published_at in Supabase
       ↓
Cleanup: elimina temp dir + vecchi deploy
       ↓
SITO LIVE SU https://{subdomain}.pages.dev
```
