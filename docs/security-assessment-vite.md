# Security Assessment — Vite + Hono Worker

**Data:** 2026-04-26  
**Scope:** Frontend Vite + backend Cloudflare Worker (migrazione da Next.js)  
**Autore:** Assessment automatico via Claude Code

---

## 1. Architettura di autenticazione

### Come funziona ora

```
Browser (Vite)
  └─ Supabase Auth SDK  ─── login/signup/refresh
  └─ localStorage["accessToken"]  ─── JWT Supabase
       │
       ▼
Hono Worker (Cloudflare Workers)
  └─ authMiddleware.ts  ─── verifica JWT con JWKS
       │
       └─ ogni route legge c.get("userId")  ─── sub claim del JWT
```

**Flusso token:**

1. Il browser chiama `supabase.auth.signInWithPassword()` → Supabase restituisce un JWT firmato (RS256/ES256).
2. Il JWT viene salvato in `localStorage["accessToken"]` e aggiornato automaticamente ad ogni `onAuthStateChange`.
3. L'interceptor Axios aggiunge `Authorization: Bearer <token>` ad ogni richiesta al Worker.
4. Se il Worker risponde 401, l'interceptor chiama `supabase.auth.refreshSession()` e riprova una volta.

**Verifica JWT nel Worker (`auth.ts`):**

- Fetch JWKS dall'issuer Supabase (`OIDC_ISSUER/.well-known/jwks.json`) con cache 1h.
- Verifica firma crittografica (ES256 o RS256 via `crypto.subtle`).
- Verifica `exp`, `nbf`, `iss`, `aud`.
- Estrae `sub` come `userId` e lo inietta nel context Hono.

**Questo è corretto.** Il Worker non accetta mai uno userId dall'esterno: lo ricava esclusivamente dal JWT verificato crittograficamente. Un attaccante non può falsificare il suo `userId` senza possedere la chiave privata di Supabase.

---

## 2. Isolamento dei dati per utente

### Database (Supabase, accesso dal Worker)

Il Worker usa `SUPABASE_SERVICE_ROLE_KEY` — questa chiave bypassa le RLS di Postgres. **L'isolamento dei dati è quindi applicato dal Worker, non da Supabase.**

Ogni route che accede a risorse di un utente filtra esplicitamente con `.eq('user_id', userId)`:

| Route | Filtro owner |
|---|---|
| `GET /projects` | `.eq('user_id', userId)` |
| `GET /projects/:id` | `.eq('user_id', userId)` |
| `PATCH /projects/:id` | `.eq('user_id', userId)` |
| `DELETE /projects/:id` | `.eq('user_id', userId)` |
| `GET /projects/:id/full` | project `.eq('user_id', userId)` |

Per le risorse figlio (pages, site-globals, blog), ogni route esegue prima una **verifica di ownership del progetto padre**:

```ts
const { data: proj } = await supabase
  .from('projects').select('id')
  .eq('id', projectId).eq('user_id', userId).single();
if (!proj) return c.json({ error: 'Project not found' }, 404);
```

Questo garantisce che anche le risorse figlio siano accessibili solo dal proprietario del progetto. Un utente che conosce l'UUID di un blog post altrui non può leggerlo, modificarlo o eliminarlo perché il check sul progetto fallisce prima.

**Campi aggiornabili:** le route PATCH usano una allowlist esplicita di campi:

```ts
const allowed = ['name', 'subdomain', 'settings', 'settings_updated_at'];
```

Un utente non può iniettare `user_id`, `id`, o altri campi privilegiati nel corpo della richiesta.

---

## 3. Upload immagini

### Flusso

Gli upload avvengono **direttamente da browser a Supabase Storage** tramite il client Supabase con `ANON_KEY`. Il Worker non gestisce upload di file.

**Path usato dal frontend:**

```
project-assets/{userId}/{projectId}/{filename}
```

Esempi:
- `project-assets/abc123/proj456/img_hash.webp` — immagine progetto
- `project-assets/abc123/ai-temp/logo-1714123456.png` — upload temporaneo AI

### RLS di Supabase Storage

Le policy presenti in `fix_storage_security.sql` controllano **`(storage.foldername(name))[1]`** (primo segmento del path):

```sql
WITH CHECK (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
)
```

> ⚠️ **PROBLEMA RILEVATO — Mismatch path vs policy**
>
> Il frontend usa path della forma `{userId}/{projectId}/{filename}`, quindi:
> - `foldername[1]` = `{userId}` (UUID dell'utente)
> - `foldername[2]` = `{projectId}` (UUID del progetto)
>
> Ma la policy controlla se `foldername[1]` è nella lista degli **ID progetto** dell'utente (`SELECT id FROM projects WHERE user_id = auth.uid()`), non se è l'UID dell'utente stesso.
>
> **In produzione, come funziona effettivamente?**
>
> Ci sono due casi:
> 1. Se l'UUID dell'utente corrisponde per caso a un UUID di progetto di quell'utente → upload passa (coincidenza improbabile).
> 2. Se non corrisponde → upload fallisce con errore RLS.
>
> Il codice nello store (`useEditorStore.ts:823-824`) ha questa gestione:
> ```ts
> const isAlreadyExists = uploadError?.message === 'The resource already exists'
>   || uploadError?.message?.includes('row-level security policy');
> if (uploadError && !isAlreadyExists) throw uploadError;
> ```
> Gli errori RLS vengono **silenziosamente ignorati** e l'upload fallisce senza notifica all'utente.
>
> **Impatto pratico:** gli upload immagini manuali potrebbero non funzionare in ambiente con RLS attiva. La policy di storage deve essere corretta (vedi sezione 6).

### Bucket pubblico

Il bucket `project-assets` è **pubblico in lettura**. Questo è intenzionale: i siti generati devono essere accessibili da Cloudflare Pages. Non costituisce un problema di sicurezza ma va tenuto presente: chiunque con l'URL pubblico di un asset può scaricarlo.

---

## 4. Limiti e crediti AI (anti-abuse)

Il sistema di limiti è applicato **server-side nel Worker**, non client-side:

- `canUseAI()` verifica il contatore `ai_used_this_month` dal DB prima di ogni chiamata AI.
- `canCreateProject()` verifica il numero di progetti esistenti prima di creare.
- `canCreatePage()` verifica il numero di pagine per progetto.
- `canCreateArticle()` verifica il numero di articoli per progetto.
- `incrementAiUsage()` aggiorna il contatore lato server dopo ogni operazione AI.

Un utente non può bypassare i limiti manipolando il frontend: il check avviene sempre nel Worker con i dati del DB.

**Rate limit deploy:** il Worker impone un cooldown di 30 secondi tra un deploy e l'altro per project (`project.last_published_at`).

---

## 5. CORS

La configurazione CORS (`cors.ts`) accetta solo origini whitelisted:

```ts
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];
// + qualsiasi *.pages.dev in produzione
// + FRONTEND_URL dall'env
```

In produzione, con `ENVIRONMENT === 'production'`, vengono accettate tutte le origini `*.pages.dev`. Questo è **leggermente permissivo**: un'altra Cloudflare Pages app di qualsiasi utente potrebbe chiamare il Worker da browser. In pratica non è exploitabile (il JWT è comunque richiesto), ma se si vuole essere rigorosi si può limitare alla sola `FRONTEND_URL`.

---

## 6. Problemi trovati e fix raccomandati

### CRITICO — RLS Storage: mismatch path

**Problema:** La policy di storage controlla `foldername[1]` contro gli ID progetto, ma il path reale è `{userId}/{projectId}/{filename}`, quindi `foldername[1]` è l'userId.

**Fix SQL:**

```sql
DROP POLICY IF EXISTS "User can upload project assets" ON storage.objects;
CREATE POLICY "User can upload project assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  (
    -- Path normale: {userId}/{projectId}/{filename}
    (
      (storage.foldername(name))[1] = auth.uid()::text AND
      (storage.foldername(name))[2] IN (
        SELECT id::text FROM public.projects WHERE user_id = auth.uid()
      )
    )
    OR
    -- Path AI temp: {userId}/ai-temp/{filename}
    (
      (storage.foldername(name))[1] = auth.uid()::text AND
      (storage.foldername(name))[2] = 'ai-temp'
    )
  )
);
-- Replicare per UPDATE e DELETE con stessa logica
```

### MEDIO — Silenzio sugli errori RLS upload

**Problema:** In `useEditorStore.ts`, gli errori RLS vengono ignorati silenziosamente. Se la policy non funziona, le immagini non vengono salvate ma l'utente non vede alcun errore.

**Fix:** Rimuovere `row-level security policy` dall'elenco degli errori ignorati. Solo "already exists" è accettabile.

```ts
const isAlreadyExists = uploadError?.message === 'The resource already exists';
if (uploadError && !isAlreadyExists) throw uploadError;
```

### BASSO — CORS permissivo in produzione

**Problema:** Qualsiasi `*.pages.dev` può fare richieste cross-origin al Worker (ma deve sempre avere un JWT valido).

**Fix opzionale:** Usare solo `FRONTEND_URL` in produzione invece del wildcard `*.pages.dev`.

### BASSO — `screenshotStoragePaths` non validato dal Worker

**Problema:** In `/ai/generate-site`, il Worker rimuove file da Supabase Storage usando i path passati dal client (`generatorInput.screenshotStoragePaths`). Un utente malintenzionato potrebbe passare path di altri utenti per cancellarli.

```ts
// worker/src/routes/ai.ts:79-80
if (generatorInput.screenshotStoragePaths?.length) {
  supabase.storage.from('project-assets').remove(generatorInput.screenshotStoragePaths).catch(() => {});
}
```

**Fix:** Prima della rimozione, filtrare i path per verificare che inizino con `${userId}/`:

```ts
const safePaths = (generatorInput.screenshotStoragePaths || [])
  .filter((p: string) => p.startsWith(`${userId}/`));
if (safePaths.length) {
  supabase.storage.from('project-assets').remove(safePaths).catch(() => {});
}
```

---

## 7. Confronto con Next.js

| Aspetto | Next.js (precedente) | Vite + Worker (attuale) |
|---|---|---|
| Auth | Server-side via Supabase SSR | JWT verifica JWKS nel Worker |
| Isolamento dati | RLS Supabase + cookies session | Filtri espliciti nel Worker con service_role |
| Upload immagini | Route API Next.js o diretta | Diretta a Supabase (con RLS browser) |
| Limiti AI | Server component / API route | Worker, check server-side |
| CORS | Non applicabile (SSR) | Whitelist origini in middleware |

La migrazione è **sostanzialmente sicura** per la parte del Worker: l'autenticazione è corretta, l'isolamento dei dati è applicato correttamente a livello applicativo. I problemi trovati riguardano la RLS di Supabase Storage (che va corretta) e un path di rimozione file non sanitizzato.

---

## 8. Riepilogo verdict

| Area | Stato |
|---|---|
| Autenticazione JWT | ✅ Sicura |
| Isolamento dati DB (progetti, pagine, blog) | ✅ Sicuro |
| Limiti piano / crediti AI | ✅ Sicuri (server-side) |
| Upload immagini (RLS Storage) | ⚠️ Policy da correggere |
| Rimozione file AI-temp | ⚠️ Path non sanitizzato |
| CORS | ⚠️ Leggermente permissivo, non critico |

**Conclusione:** l'architettura è corretta nei punti fondamentali. Nessun utente può accedere o modificare i dati di un altro tramite le API del Worker. Il problema principale è nella RLS di Supabase Storage, che nella sua forma attuale probabilmente non funziona come atteso (upload silenziosamente falliti o policy inefficace). Va corretto prima del go-live.
