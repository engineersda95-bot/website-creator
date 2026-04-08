# Sicurezza — Audit, Vulnerabilita e Azioni Correttive

> Analisi completa della superficie di attacco di SitiVetrina.

---

## Riepilogo

Gravita CRITICA: 3 problemi
Gravita ALTA: 2 problemi
Gravita MEDIA: 2 problemi
Gravita BASSA: 4 problemi

---

## CRITICO — Azioni immediate

### 1. API Keys nel file .env esposti nel repository

**Dove:** `.env`

Il file `.env` contiene:
- Cloudflare API Token (controllo totale account, puo eliminare progetti)
- Gemini API Key (uso non autorizzato, esaurimento quota)
- Supabase URL e Anon Key (intenzionale per le NEXT_PUBLIC, ma le altre no)

**Rischio:** Chiunque abbia accesso al repository puo controllare l'infrastruttura Cloudflare, generare contenuti AI a vostre spese, e potenzialmente accedere ai dati.

**Azione:**
1. Ruotare IMMEDIATAMENTE tutti i token/key (Cloudflare, Gemini)
2. Verificare che `.env` sia in `.gitignore` (dovrebbe gia esserci)
3. Se il repo e mai stato pubblico o condiviso, considerare tutti i token compromessi
4. Usare Vercel Environment Variables per produzione, non file .env
5. Mai committare `.env` — usare `.env.example` con valori placeholder

---

### 2. Command Injection nel deploy

**Dove:** `app/actions/deploy.ts`

```typescript
const command = `npx --yes wrangler@3 pages deploy "${tempDir}" --project-name="${projectName}"`;
execSync(command, { ... });
```

Il `projectName` viene dal campo `subdomain` del progetto. Se un utente riesce a inserire caratteri shell nel subdomain (es. `test"; rm -rf /; echo "`), il comando viene iniettato.

**Rischio:** Esecuzione arbitraria di comandi sul server.

**Mitigazione attuale:** Il subdomain viene probabilmente validato all'inserimento, ma non c'e una validazione esplicita prima dell'uso in `execSync`.

**Azione:**
1. Validare il subdomain con regex strict: `/^[a-z0-9-]+$/`
2. Sostituire `execSync` con `spawn` passando argomenti come array (mai stringa):
```typescript
const { execFileSync } = require('child_process');
execFileSync('npx', ['--yes', 'wrangler@3', 'pages', 'deploy', tempDir,
  `--project-name=${projectName}`, '--branch=main'], { ... });
```

---

### 3. SSRF in fetchImageAsBase64

**Dove:** `app/actions/ai-generator.ts`

```typescript
async function fetchImageAsBase64(url: string) {
    const response = await fetch(url); // Nessun timeout, nessun limite size
}
```

Problemi:
- **Nessun timeout** — il server puo restare appeso indefinitamente
- **Nessun limite dimensione** — risposta multi-GB puo esaurire la memoria
- **Validazione dominio bypassabile** — `hostname.endsWith('supabase.co')` accetta anche `supabase.co.attacker.com`
- **IP interni non bloccati** — `localhost`, `127.0.0.1`, `192.168.x.x`, `10.x.x.x` non filtrati
- **Protocolli non bloccati** — `file://`, `gopher://` non filtrati

**Rischio:** Un attaccante puo far fare richieste HTTP arbitrarie al server, accedere a servizi interni, o esaurire risorse.

**Azione:**
```typescript
async function fetchImageAsBase64(url: string) {
    // 1. Validazione URL strict
    const parsed = new URL(url);
    if (!['https:'].includes(parsed.protocol)) return null;
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) return null;
    if (parsed.hostname.match(/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/)) return null;
    if (!ALLOWED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) return null;

    // 2. Timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    // 3. Fetch con limite dimensione
    const response = await fetch(url, { signal: controller.signal });
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) return null; // 5MB max

    return ...;
}
```

---

## ALTO — Da risolvere prima del lancio

### 4. Nessun rate limiting

**Dove:** Tutto il backend

Nessun endpoint ha rate limiting:
- Login: brute force illimitato
- AI generation: spam illimitato (costa soldi)
- Deploy: spam illimitato (consuma risorse Cloudflare)
- Creazione progetti: spam illimitato

**Rischio:** DDoS sulle operazioni costose, brute force sulle password, abuso dei crediti AI.

**Azione:**
- Aggiungere rate limiting a livello di middleware o edge function Supabase
- Login: max 5 tentativi/minuto per IP
- AI: max 1 generazione/minuto per utente (gia limitato mensilmente, ma non per burst)
- Deploy: max 1/minuto per progetto
- Opzioni: Vercel Edge Middleware con `@upstash/ratelimit`, oppure Cloudflare Workers come proxy

---

### 5. Domini custom senza verifica di proprietà

**Dove:** `app/actions/deploy.ts`, `supabase/add_custom_domain.sql`

L'utente puo associare qualsiasi dominio al proprio progetto senza dimostrare di esserne il proprietario. Il sistema aggiunge il dominio direttamente su Cloudflare.

**Rischio:**
- Un utente reclama `google.com` come dominio custom
- Subdomain takeover: un utente reclama un dominio abbandonato che punta ancora al vecchio Cloudflare Pages
- Conflitto: due utenti reclamano lo stesso dominio

**Azione:**
1. Richiedere validazione DNS prima di attivare il dominio:
   - Generare un token univoco (es. `sitivetrina-verify-abc123`)
   - L'utente deve creare un record TXT: `_sitivetrina-verify.dominio.com TXT abc123`
   - Il server verifica il record DNS prima di aggiungere il dominio a Cloudflare
2. Aggiungere un campo `domain_verification_token` alla tabella projects
3. Implementare un endpoint di verifica che controlla il DNS

---

## MEDIO — Da risolvere a breve

### 6. Nessuna validazione tipo file negli upload

**Dove:** Storage Supabase, upload immagini

Non c'e validazione server-side del tipo di file caricato. Le policy RLS controllano chi puo caricare, ma non cosa.

**Rischio:** Upload di file eseguibili, HTML malevolo, o file enormi non-immagine.

**Azione:**
- Aggiungere validazione MIME type server-side (o in una Supabase Edge Function trigger)
- Whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- Limite dimensione: gia presente lato client (5MB), aggiungere anche lato storage policy
- Attenzione a SVG: puo contenere script JS — considerare di sanitizzare o bloccare

---

### 7. Policy DELETE mancante sulla tabella projects

**Dove:** `supabase/schema.sql`

La tabella `projects` ha policy per SELECT, INSERT, UPDATE ma non per DELETE. Questo significa che la cancellazione di un progetto funziona solo perche la Server Action usa il service role key (che bypassa RLS), non perche ci sia una policy che lo permette.

**Rischio:** Se in futuro si aggiunge una funzione di delete lato client senza passare per una Server Action, non funzionera — o peggio, se RLS viene disabilitato per errore, chiunque potrebbe eliminare progetti.

**Azione:**
```sql
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

---

## BASSO — Miglioramenti consigliati

### 8. Console.error con dati sensibili

**Dove:** `app/actions/deploy.ts`, `app/actions/ai-generator.ts`

I `console.error` in produzione possono loggare path del filesystem, messaggi di errore con dettagli interni, e in alcuni casi token parziali.

**Azione:** Usare un logger strutturato che maschera i dati sensibili in produzione.

---

### 9. File temporanei non sempre puliti

**Dove:** `app/actions/deploy.ts`

La temp directory viene creata in `/tmp/siti-vetrina-deploy-{timestamp}` e pulita nel `finally` block. Ma se il processo Node.js crasha (OOM, sigkill), i file restano.

**Azione:** Aggiungere un cleanup periodico di `/tmp/siti-vetrina-deploy-*` con eta > 1 ora. Puo essere un cron job o parte dell'edge function `cleanup-storage`.

---

### 10. AI debug mode in produzione

**Dove:** `app/actions/ai-generator.ts`

```typescript
const AI_DEBUG_SAVE = process.env.AI_DEBUG_SAVE_PROMPTS === 'true';
```

Se abilitato, salva prompt e risposte AI in `.ai-debug/`. Potrebbe contenere dati business sensibili degli utenti.

**Azione:** Assicurarsi che `AI_DEBUG_SAVE_PROMPTS` non sia mai `true` in produzione. Aggiungere un check esplicito che lo disabilita se `NODE_ENV === 'production'`.

---

### 11. customScriptsHead/Body — JS arbitrario nei siti

**Dove:** `types/editor.ts` (ProjectSettings), `lib/generate-static.tsx`

Gli utenti Pro/Agency possono iniettare script arbitrari nell'HTML dei loro siti. Questo e intenzionale (Google Analytics, chat widget, ecc.) ma ha implicazioni:

- Un utente malintenzionato potrebbe creare un sito di phishing con JS malevolo
- Il sito e su un dominio `.pages.dev` che potrebbe sembrare legittimo

**Mitigazione attuale:** Feature gated dietro piano Pro/Agency (`can_custom_scripts`).

**Azione:**
- Aggiungere un disclaimer/accettazione ToS quando l'utente abilita gli script custom
- Considerare una blacklist di pattern noti (es. `document.cookie`, `eval(`, `window.opener`)
- Monitorare i siti pubblicati per contenuti malevoli (puo essere fatto async)

---

## Cosa e gia sicuro

### Autenticazione
- Supabase Auth con email/password
- Middleware protegge le route `/editor/*`
- Tutte le Server Actions verificano `supabase.auth.getUser()` prima di mutare dati
- Session gestita via cookie sicuro da Supabase

### Row-Level Security (per la maggior parte)
- projects: solo propri
- pages: solo di propri progetti
- site_globals: solo di propri progetti
- profiles: solo il proprio
- plans: lettura pubblica (intenzionale)
- storage: lettura pubblica (intenzionale per siti live), scrittura solo propri

### Input sanitization
- Nessun `dangerouslySetInnerHTML` con input utente non controllato nel codebase
- Contenuti utente renderizzati tramite componenti React (escaping automatico)
- Validazione lunghezza input AI
- Slug e subdomain filtrati (solo caratteri alfanumerici e trattini)

### Separazione client/server
- Le API key sensibili (Cloudflare, Gemini) sono solo in variabili server-side (non NEXT_PUBLIC)
- Le Server Actions (`'use server'`) non espongono logica al client
- Il Supabase anon key (NEXT_PUBLIC) ha accesso limitato dalle policy RLS

### Storage
- Path traversal prevenuto dalla struttura delle policy RLS
- Ownership verificata tramite subquery su projects.user_id
- Bucket pubblico in lettura (necessario per siti live), ma scrittura protetta

---

## Priorita di intervento

**Prima del lancio pubblico (bloccanti):**
1. Ruotare API keys
2. Fix command injection in deploy (spawn invece di execSync)
3. Fix SSRF in fetchImageAsBase64
4. Aggiungere rate limiting base (login + AI + deploy)

**Entro il primo mese:**
5. Verifica proprietà domini custom
6. Validazione tipo file upload
7. Policy DELETE su projects
8. Disabilitare AI debug in produzione

**Miglioramenti continui:**
9. Logger strutturato
10. Cleanup temp files periodico
11. Monitoring script custom per abusi
12. Penetration test esterno

---

## File coinvolti

File con vulnerabilita critiche:
- `app/actions/deploy.ts` — command injection, cleanup
- `app/actions/ai-generator.ts` — SSRF, debug mode
- `.env` — credenziali esposte

File con vulnerabilita medie:
- `supabase/schema.sql` — policy DELETE mancante
- `supabase/add_custom_domain.sql` — nessuna verifica proprietà

File con best practice da migliorare:
- `lib/supabase/middleware.ts` — rate limiting
- `lib/generate-static.tsx` — custom scripts sanitization
