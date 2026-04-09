# Strategia di Deploy — Deploy Incrementale, Cloudflare Pages e Architetture Alternative

> Analisi delle opzioni di hosting per siti statici generati dal builder, con focus sul blog, sui limiti Cloudflare Pages e su quando conviene passare a VPS+CDN.

---

## Indice

1. [Il Problema del Deploy Completo](#1-il-problema-del-deploy-completo)
2. [Deploy Incrementale — Come Implementarlo](#2-deploy-incrementale--come-implementarlo)
3. [Cloudflare Pages — Limiti e Vincoli](#3-cloudflare-pages--limiti-e-vincoli)
4. [Confronto Architetture](#4-confronto-architetture)
5. [Raccomandazione](#5-raccomandazione)

---

## 1. Il Problema del Deploy Completo

### Stato attuale

Ogni volta che l'utente clicca "Pubblica", la pipeline in `app/actions/deploy.ts` rigenera **tutto**:

```
Fetch tutti i dati → genera tutti gli HTML → compila Tailwind → wrangler upload tutto
```

Per un sito con 5 pagine e 0 articoli blog il tempo è accettabile (~15-30s). Ma con un blog attivo la situazione cambia radicalmente:

| Scenario | Pagine | Articoli | Tempo stimato |
|----------|--------|----------|---------------|
| Sito vetrina piccolo | 5 | 0 | ~15s |
| Sito con blog attivo | 5 | 30 | ~40-60s |
| Sito con blog grande | 8 | 100 | ~2-3 min |
| Blog editoriale | 10 | 500 | >10 min (timeout Vercel) |

Il timeout delle Vercel Server Actions è **300 secondi** (5 minuti). Con Tailwind compilation + Wrangler upload, 500 articoli supererebbe facilmente questo limite.

### Perché il blog amplifica il problema

Ogni articolo blog genera un file HTML a sé (`/blog/{slug}/index.html`). Oltre agli articoli stessi, quando viene pubblicato un nuovo articolo bisogna ripubblicare anche:

1. `/blog/index.html` — la listing aggiornata (nuovo articolo appare)
2. Ogni pagina che contiene un blocco `blog-list` — mostra gli ultimi articoli
3. `sitemap.xml` — include il nuovo URL

Al momento nessuno di questi aggiornamenti dipendenti è gestito automaticamente: l'utente deve ripubblicare tutto manualmente.

---

## 2. Deploy Incrementale — Come Implementarlo

### Principio

Confrontare `updated_at` di ogni risorsa con `last_published_at` del progetto per rigenerare solo i file che hanno subito modifiche dall'ultimo deploy.

### Cosa va sempre rigenerato (dipendenze obbligatorie)

Anche in un deploy incrementale, certi file hanno dipendenze trasversali che obbligano la rigenerazione:

| File | Motivo del rigenero obbligatorio |
|------|----------------------------------|
| `sitemap.xml` | Sempre, include tutti gli URL |
| `robots.txt` | Se cambia `indexable` su qualunque pagina |
| `_headers` | Solo se cambia la struttura |
| `/blog/index.html` | Se qualunque articolo è cambiato/aggiunto |
| Pagine con blocco `blog-list` | Se nuovi articoli pubblicati dall'ultimo deploy |
| `assets/styles.css` | Se è cambiato un blocco con nuove classi Tailwind |

### Strategia per gli articoli

```typescript
// Pseudo-logica deploy incrementale blog
const lastPublished = project.last_published_at;

// Articoli modificati dopo l'ultimo deploy
const changedPosts = posts.filter(p =>
  !lastPublished || new Date(p.updated_at) > new Date(lastPublished)
);

// Rigenerare anche la listing se ci sono articoli nuovi/modificati
const needsListingRegen = changedPosts.length > 0;

// Pagine con blog-list block → da rigenerare se listing è cambiata
const pagesWithBlogList = pages.filter(p =>
  p.blocks?.some(b => b.type === 'blog-list')
);
```

### Problema con Tailwind

Il CSS è compilato da Wrangler scansionando **tutti** gli HTML. Se rigeneriamo solo una subset di file, il CSS potrebbe perdere classi usate da file non rigenerati. Soluzioni:

**Opzione A — Sempre ricompilare il CSS** (semplice, sicuro)
Costo marginale: la compilazione Tailwind impiega ~3-5s. Accettabile.

**Opzione B — Upload incrementale su Cloudflare (non supportato nativamente)**
Wrangler non supporta "upload solo file cambiati" — fa sempre un deployment completo. Però si può separare il processo:
1. Generare e mettere in cache gli HTML invariati in Supabase (come file o JSONB)
2. Al deploy, prelevare la cache per i file invariati + rigenerare solo i cambiati
3. Wrangler fa comunque upload di tutto, ma si risparmia la fase di generazione

**Opzione C — Cache HTML in Supabase (raccomandata per il lungo termine)**
Aggiungere una colonna `cached_html` su `pages` e `cached_html` su `blog_posts`. Al deploy:
- Se `updated_at <= last_published_at`: usa la cache
- Se `updated_at > last_published_at`: rigenera e aggiorna la cache

Questo riduce drasticamente il tempo di generazione per siti grandi.

### Impatto reale atteso

| Scenario | Deploy completo | Deploy incrementale |
|----------|----------------|---------------------|
| Pubblica 1 nuovo articolo (blog da 50) | ~60s | ~8s |
| Modifica 1 pagina (5 pagine, 50 articoli) | ~60s | ~12s |
| Pubblica sito per la prima volta | ~60s | ~60s (sempre completo) |

---

## 3. Cloudflare Pages — Limiti e Vincoli

> Fonte ufficiale verificata: [developers.cloudflare.com/pages/platform/limits](https://developers.cloudflare.com/pages/platform/limits/) e [pages.cloudflare.com/#pricing](https://pages.cloudflare.com/#pricing) — aprile 2025.

### Nota sulle metriche "Workers & Pages" nel dashboard

Il pannello Cloudflare mostra metriche aggregate sotto "Workers & Pages": _Requests today (0/100,000)_, _CPU time_, _Workers build mins_. Questi limiti riguardano **Cloudflare Workers** (funzioni serverless), **non Pages**. Il builder usa solo Pages per servire HTML statico — quelle metriche sono irrilevanti. Pages ha richieste HTTP e bandwidth **illimitate** su tutti i piani.

### Prezzi dei piani applicazione Cloudflare

| Piano | Mensile | Annuale |
|-------|---------|---------|
| **Free** | $0 | $0 |
| **Pro** | $25/mese | $20/mese |
| **Business** | $250/mese | $200/mese |
| **Enterprise** | Custom | Custom |

Questi sono i piani "applicazione" per domini/siti web, distinti dal Workers Paid ($5/mese che abilita Workers avanzati). Per Pages è il piano applicazione che conta.

### Limiti Pages per piano

| Limite | Free | Pro | Business | Enterprise |
|--------|------|-----|----------|------------|
| **Siti (progetti)** | soft 100¹ | soft 100¹ | soft 100¹ | soft 100¹ |
| **File per sito** | 20.000 | 100.000² | 100.000² | 100.000² |
| **Dimensione singolo file** | 25 MiB | 25 MiB | 25 MiB | 25 MiB |
| **Dimensione totale deployment** | non documentata | non documentata | non documentata | non documentata |
| **Build/mese (solo Git push)** | 500 | 5.000 | 20.000 | Custom |
| **Build concorrenti** | 1 | 5 | 20 | Custom |
| **Deploy direct upload (wrangler)** | Illimitati | Illimitati | Illimitati | Illimitati |
| **Custom domains per progetto** | 100 | 250 | 500 | 500 |
| **Richieste HTTP statiche** | Illimitate | Illimitate | Illimitate | Illimitate |
| **Bandwidth** | Illimitata | Illimitata | Illimitata | Illimitata |

¹ La pagina pricing dichiara **"unlimited sites"** per tutti i piani. La pagina dei limiti precisa che 100 è un _soft limit_ anti-abuso alzabile su richiesta (vedi sotto). **Non è un hard cap fisso di piano.**

² Richiede `PAGES_WRANGLER_MAJOR_VERSION=4` nelle variabili d'ambiente del progetto Pages.

### Il limite dei 100 progetti è soft, non hard

Testo esatto dalla documentazione ufficiale:

> _"Cloudflare Pages has a **soft limit** of 100 projects within your account **in order to prevent abuse**. If you need this limit raised, contact your Cloudflare account team or use the **Limit Increase Request Form**."_

Il limite non è un differenziatore tra piano Free e Pro — è lo stesso su tutti i piani. La pagina pricing dice "unlimited sites" proprio perché è un limite operativo anti-abuso, non commerciale. Un builder con 200+ siti può richiedere l'aumento via form ufficiale senza costi aggiuntivi.

### Chiarimento sul limite 25 MiB e la dimensione totale

**Il 25 MiB è per singolo file.** La documentazione Cloudflare non pubblica un limite esplicito sulla dimensione totale del deployment.

**Ma non è illimitato** — hai ragione a essere scettico. Il vincolo reale è il numero di file (20.000 × 25 MiB = 480 GB teorico massimo assoluto, ma ovviamente Pages non è pensato per stoccare GB di dati). Per asset web reali il totale è irrilevante: Cloudflare può applicare limiti operativi non documentati su account anomali, ma per siti web normali non esiste un vincolo pratico di dimensione totale.

**Perché esiste R2 allora?** R2 è object storage generico per file arbitrariamente grandi (video, backup, blob), con costo per GB e nessun limite per file. Pages è ottimizzato esclusivamente per asset web statici (HTML, CSS, JS, immagini). Non sono concorrenti — hanno scopi diversi. Chi usa Pages per video o grandi PDF sbaglia strumento.

**Dimensioni reali per il builder:**

| Scenario | File totali | Dimensione totale |
|----------|------------|-------------------|
| Sito vetrina (5 pagine, 10 img) | ~17 file | ~5 MB |
| Sito + blog (5 pagine, 50 articoli, 20 img) | ~77 file | ~30 MB |
| Blog grande (10 pagine, 300 articoli, 100 img) | ~415 file | ~200 MB |
| Limite free (20.000 file) raggiunto | 20.000 file | ~2–10 GB — irrealistico per un sito normale |

Per il builder il limite file count non è mai un problema: un sito con 1.000 articoli = ~1.200 file, il 6% del limite free.

### Meccanica di Wrangler — l'upload è differenziale per i dati

`wrangler pages deploy` funziona in modo più intelligente di quanto sembri dall'esterno:

1. Wrangler calcola l'hash SHA-256 di ogni file nella directory locale
2. Interroga l'API Cloudflare: "quali di questi hash hai già?"
3. Carica **solo i file con hash non ancora presenti** — gli altri vengono referenziati dalla cache esistente
4. Crea il deployment puntando al mix di file nuovi + file già cachati

**Questo significa che Wrangler fa upload differenziale nativo dei dati trasferiti.** Se un sito ha 500 file e ne cambiano 3, vengono fisicamente trasmessi solo 3 file. Il tempo di rete è proporzionale ai file cambiati, non al totale. Questo risolve il problema di performance del trasferimento, ma non quello della generazione HTML (vedi sezione 2 per la cache lato builder).

**Limiti Wrangler da documentare:**

| Limite | Valore | Impatto sul builder |
|--------|--------|---------------------|
| File per deployment | 20.000 (free) / 100.000 (paid, con env var) | Nessuno — siti normali hanno <2.000 file |
| Dimensione singolo file | 25 MiB | Nessuno — immagini WebP ≤1.8 MB |
| Dimensione totale | Non documentata | Nessuno per siti web normali |
| Rate limit API Cloudflare | 1.200 req / 5 min per account | Rilevante se molti utenti deployano in contemporanea → retry + backoff |
| Build concorrenti direct upload | Non documentato | Cloudflare gestisce internamente; in pratica deployments multipli simultanei funzionano |

**Errori possibili con Wrangler:**

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `Too many projects` | Soft limit 100 raggiunto | Richiedere limit increase via form |
| `File too large` | Un file >25 MiB | Mai con immagini WebP ottimizzate; solo con PDF/video |
| `Too many files` | >20.000 file (free) | Improbabile; passare a piano paid se necessario |
| `Authentication failed` | Token API scaduto o permessi mancanti | Verificare `CLOUDFLARE_API_TOKEN` con permessi Pages Write |
| Rate limit (HTTP 429) | Molti deploy simultanei | Retry con exponential backoff nella Server Action |
| Timeout upload | Connessione lenta o file molti | Wrangler riprova automaticamente per i file mancanti |

**Direct upload non conta come build**
`wrangler pages deploy` **non consuma le 500 build mensili** del piano free. Le build mensili si contano solo con l'integrazione Git. Nessuna preoccupazione.

### Sul limit increase per i 100 progetti — aspettative realistiche

Non è garantito, ma è ragionevole aspettarsi un'approvazione per uso legittimo:

**Più probabile se:**
- Account con piano Pro/Business attivo (segnale di cliente pagante serio)
- Si spiega il caso d'uso: "SaaS builder che deploya siti statici per clienti"
- I deployment hanno traffico reale, siti web normali (non spam/phishing)

**Meno probabile / con attesa maggiore se:**
- Account free senza storico
- Nessun contesto fornito nel form
- Molti progetti creati e cancellati in poco tempo (pattern anomalo)

**Se viene negato**: nessun altra opzione lecita su Cloudflare — VPS è la strada. Per un builder a regime con clienti paganti, €4/mese per un Hetzner è comunque la scelta più stabile e indipendente a lungo termine.

**Subdomain `.pages.dev` non rinominabile**
Il subdomain è determinato alla creazione del progetto. Una volta creato non si può modificare — va eliminato e ricreato (si perde la storia dei deployment).

---

## 4. Confronto Architetture

### A — Cloudflare Pages (attuale)

```
Builder (Vercel) → genera HTML → wrangler → Cloudflare Pages CDN
```

**Pro:**
- Zero configurazione server
- CDN globale automatica (200+ PoP)
- SSL automatico
- Bandwidth illimitata
- Free per i primi 100 siti
- Latenza eccellente per utenti finali
- Nessun costo fisso per hosting siti

**Contro:**
- Soft limit 100 progetti (alzabile via form, non garantito)
- Wrangler trasferisce solo i file cambiati (hash-based), ma genera sempre un deployment completo — la fase lenta è la generazione HTML lato builder, non il trasferimento
- Nessun controllo sulla cache (Cloudflare gestisce)
- Dipendenza da un vendor
- Se Cloudflare ha un outage, tutti i siti down

**Costi indicativi:**
- 0-100 siti: $0/mese
- 100+ siti: $0/mese (richiedere limit increase via form ufficiale Cloudflare)
- Se il limit increase viene negato o si vuole piena indipendenza: passare a VPS

---

### B — VPS + Nginx + Cloudflare CDN free (proxy mode)

```
Builder (Vercel) → genera HTML → rsync SSH → VPS Nginx ← Cloudflare CDN (proxy gratuito)
```

Ogni sito utente è una directory su Nginx con virtual host dedicato. Cloudflare fa da CDN/proxy davanti con il piano **free** — basta puntare il DNS del dominio del sito utente attraverso Cloudflare (record `A` con proxy arancione). Il VPS non è mai esposto direttamente.

**Questo è il setup più usato al mondo per siti statici ad alto volume**: Hetzner (o qualsiasi VPS) + Cloudflare free CDN davanti. Nessun costo CDN, nessun limite di traffico, SSL automatico gestito da Cloudflare.

**Pro:**
- Nessun limite sul numero di siti
- Deploy incrementale nativo con rsync (invia solo file cambiati)
- Pieno controllo su cache, headers, routing
- Costo fisso prevedibile indipendente dal numero di siti
- Cloudflare CDN gratuito davanti: edge caching globale, SSL, DDoS protection
- SSL: Cloudflare gestisce il certificato verso l'utente finale; tra Cloudflare e VPS si può usare un self-signed (modalità "Full") o Certbot (modalità "Full Strict")
- Possibilità di aggiungere funzionalità server-side future (form handler, webhook, redirect)

**Contro:**
- Costo fisso mensile anche a 0 utenti (~€4)
- Gestione server: aggiornamenti OS, sicurezza, backup (ma per Nginx statico è minima)
- Un singolo VPS è un single point of failure (mitigato da Cloudflare CDN che continua a servire la cache anche se il VPS è down)
- Scalabilità: un VPS ha un tetto — ma per siti statici Nginx gestisce migliaia di richieste/sec con 1 vCPU

**Stack:**

| Componente | Scelta | Costo |
|-----------|--------|-------|
| VPS | Hetzner CAX11 (ARM, 2 vCPU, 4GB RAM, 20TB traffico) | €3.79/mese |
| Web server | Nginx | free |
| SSL verso utente finale | Cloudflare (gestito automaticamente) | free |
| CDN | Cloudflare free proxy | free |
| Deploy | rsync via SSH dalla Server Action | free |

**Deploy incrementale con rsync:**
```bash
rsync -az --delete \
  --checksum \        # confronta hash file, non solo mtime
  /tmp/build-dir/ \
  user@vps:/var/www/{subdomain}/
```

`rsync --checksum` invia solo i file effettivamente cambiati confrontando il checksum — deploy incrementale nativo senza nessun lavoro extra nel builder. Per un articolo blog nuovo su un sito da 50 articoli si trasferiscono ~3 file.

**Configurazione Nginx (template per ogni sito):**
```nginx
# /etc/nginx/sites-enabled/{subdomain}.conf
server {
    listen 80;
    server_name {subdomain}.tuodominio.com www.{subdomain}.tuodominio.com;
    root /var/www/{subdomain};
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # Cache lunga per assets hash-based (immutabili)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_static on;
    gzip_types text/html text/css application/javascript image/svg+xml;
}
```

Cloudflare gestisce HTTPS verso l'utente finale. Nginx serve HTTP o HTTPS localmente (con Cloudflare in "Full" mode non serve certificato reale sul VPS).

**Generazione automatica virtual host:**
La Server Action di deploy può generare il file `.conf` via SSH e fare `nginx -s reload` (o usare un API interna sul VPS per questo). In alternativa un singolo virtual host wildcard gestisce tutti i sottodomini:

```nginx
server {
    server_name ~^(?<subdomain>.+)\.tuodominio\.com$;
    root /var/www/$subdomain;
    ...
}
```

**Costi totali:**

| Siti attivi | Costo mensile | Dettaglio |
|-------------|--------------|-----------|
| 0-500 | €3.79 | Hetzner CAX11 + Cloudflare free |
| 500-2.000 | €7.49 | Hetzner CAX21 (4 vCPU, 8GB) + Cloudflare free |
| 2.000-5.000 | €14.99 | Hetzner CAX31 (8 vCPU, 16GB) + Cloudflare free |
| 5.000+ | ~€30 | Hetzner + load balancer |

Il traffico Hetzner (20TB inclusi nel piano base) è più che sufficiente perché Cloudflare fa da CDN: il VPS riceve solo le richieste di cache miss (tipicamente <5% del traffico totale).

---

### C — Object Storage + CDN (es. Cloudflare R2 o AWS S3 + CloudFront)

```
Builder (Vercel) → genera HTML → upload R2/S3 → CDN davanti
```

Ogni file viene caricato come oggetto in un bucket. La CDN serve direttamente dal bucket.

**Con Cloudflare R2:**
- 0 egress fee (a differenza di S3)
- 10 GB storage gratuiti, poi $0.015/GB
- Serve file via Worker o Custom Domain
- Deploy via AWS SDK (compatibile S3)

**Pro:**
- Scalabilità infinita (object storage non ha limite di progetti)
- Deploy veramente incrementale (upload solo file cambiati confrontando ETag/hash)
- Costo storage bassissimo
- Zero manutenzione server

**Contro:**
- Più complesso da configurare (routing, custom domain per sito)
- R2 con custom domain richiede Workers per il routing
- S3 + CloudFront ha egress fee elevati per molto traffico

**Deploy incrementale con R2:**
```typescript
// Carica solo se hash diverso
const existingETag = await r2.headObject({ Key: filePath });
const newHash = sha256(fileContent);
if (existingETag !== newHash) {
    await r2.putObject({ Key: filePath, Body: fileContent });
}
```

---

### D — Ibrido: Cloudflare Pages per siti piccoli, VPS per grandi

Mantenere Pages come default e aggiungere la possibilità di migrare a VPS per progetti con blog molto attivi o utenti agency.

```
Free/Starter → Cloudflare Pages (semplice, zero costo)
Pro/Agency   → VPS dedicato o bucket R2 (più controllo, incrementale)
```

Richiede astrazione nel builder per supportare due backend di deploy.

---

## 5. Raccomandazione

### Breve termine (0-100 siti)

**Restare su Cloudflare Pages**, è gratis e funziona bene. Due priorità:

1. **Deploy incrementale per blog**: implementare la logica di cache `cached_html` su `blog_posts`, rigenerare solo gli articoli con `updated_at > last_published_at`. Wrangler carica comunque tutto ma si risparmia la fase lenta (generazione + Tailwind per N articoli).

2. **Timeout safeguard**: aggiungere un limite sul numero di articoli rigenerabili in un singolo deploy (es. max 150 articoli), con messaggio all'utente se il blog è troppo grande per un deploy completo.

### Oltre i 100 siti

Il soft limit da 100 progetti è **alzabile gratuitamente** via [form ufficiale Cloudflare](https://forms.gle/ukpeZVLWLnKeixDu7). Per un builder questo è il primo passo — non richiede cambio architettura né costi.

Se Cloudflare non concede l'aumento (improbabile ma possibile), o se si preferisce indipendenza da vendor, il passaggio naturale è VPS.

**Il setup raccomandato per lo scaling**: Hetzner CAX11 (€3.79/mese) + Nginx + Cloudflare free in proxy mode.

Il Cloudflare CDN free in proxy mode dà la stessa rete edge globale di Pages per l'utente finale. La differenza è solo nel backend: Pages è serverless gestito da Cloudflare, VPS è una macchina propria con Nginx. Per siti statici la differenza pratica è minima.

Per un builder di siti statici il VPS ha pochissima manutenzione: Nginx non va quasi mai aggiornato d'urgenza, i siti statici non hanno superficie d'attacco, il backup è opzionale (i file si rigenerano dal DB in qualsiasi momento).

### Matrice decisionale

| Condizione | Soluzione |
|------------|-----------|
| < 100 siti, no blog | Cloudflare Pages free — nessuna modifica |
| < 100 siti, blog attivo | Pages free + deploy incrementale blog |
| > 100 siti | Richiedere limit increase a Cloudflare (free, via form) |
| Limit increase negato / indipendenza da vendor | VPS Hetzner + Nginx + Cloudflare free CDN |
| Utenti agency con account CF proprio | Bring-your-own account (opzione futura) |

### Note su CDN alternative al Cloudflare free

Se per qualche motivo non si vuole usare Cloudflare come CDN davanti al VPS (dipendenza vendor, policy del cliente, ecc.):

| CDN | Prezzo | Note |
|-----|--------|------|
| **Cloudflare free (proxy)** | Gratis | Consigliato. Bandwidth illimitata, SSL, DDoS, edge globale |
| **Bunny CDN** | ~$0.005/GB EU | Molto economico, semplice da configurare via pull zone |
| **Fastly** | ~$0.12/GB | Premium, ottimo per API e contenuti dinamici — overkill per statico |
| **AWS CloudFront** | ~$0.085/GB EU | Ottimo ma egress fee che sommano su traffico alto |
| **KeyCDN** | ~$0.04/GB | Buon compromesso prezzo/qualità |

Per siti statici con utenti principalmente europei, **Cloudflare free + VPS Hetzner in Germania** è di gran lunga la scelta più conveniente e performante. Non ha senso pagare per un CDN quando Cloudflare lo offre gratuitamente con la stessa qualità.

---

## Appendice — Limiti Cloudflare Pages (da documentazione ufficiale)

> Fonte: [developers.cloudflare.com/pages/platform/limits](https://developers.cloudflare.com/pages/platform/limits/) — aprile 2025.

| Voce | Free | Pro | Business | Enterprise |
|------|------|-----|----------|------------|
| **Prezzo** | $0 | $25/mese ($20 annuale) | $250/mese ($200 annuale) | Custom |
| **Progetti per account** | soft 100* | soft 100* | soft 100* | soft 100* |
| **File per sito** | 20.000 | 100.000 | 100.000 | 100.000 |
| **Dimensione singolo file** | 25 MiB | 25 MiB | 25 MiB | 25 MiB |
| **Dimensione totale deployment** | non documentata | non documentata | non documentata | non documentata |
| Build/mese (solo Git push) | 500 | 5.000 | 20.000 | Custom |
| Build concorrenti | 1 | 5 | 20 | Custom |
| Deploy direct upload (wrangler) | Illimitati | Illimitati | Illimitati | Illimitati |
| Custom domains per progetto | 100 | 250 | 500 | 500 |
| Richieste HTTP a Pages | Illimitate | Illimitate | Illimitate | Illimitate |
| Bandwidth | Illimitata | Illimitata | Illimitata | Illimitata |
| Preview deployments | Illimitati | Illimitati | Illimitati | Illimitati |

\* Soft limit anti-abuso, alzabile gratuitamente via [form ufficiale](https://forms.gle/ukpeZVLWLnKeixDu7). La pagina pricing dichiara "unlimited sites" per tutti i piani.

> **Metriche "Requests today 0/100,000" nel dashboard**: si riferiscono a **Cloudflare Workers**, non a Pages. Pages ha richieste illimitate. Quelle metriche sono irrilevanti per il builder.
