# Sicurezza — Audit, Vulnerabilita e Azioni Correttive

> Analisi completa della superficie di attacco di SitiVetrina.
>
> Legenda stato: ✅ Risolto · ⚠️ Già mitigato · 🔴 Da fare · 🟡 Bassa priorità

---

## Riepilogo

Gravita CRITICA: 3 problemi (2 risolti, 1 già mitigato)
Gravita ALTA: 2 problemi (1 risolto, 1 da fare)
Gravita MEDIA: 2 problemi (da fare)
Gravita BASSA: 4 problemi (invariati)

---

## CRITICO

### 1. API Keys nel file .env esposti nel repository ⚠️

**Dove:** `.env`

Non rilevante: il progetto è un SaaS privato, gli utenti accedono all'editor dal dominio pubblico e non alla codebase. Il file `.env` è locale e non è mai stato nel repository pubblico.

**Unica azione raccomandata:** Verificare che `.env` sia in `.gitignore` e non sia mai stato committato per errore.

---

### 2. Command Injection nel deploy ✅

**Dove:** [`app/actions/deploy.ts`](../app/actions/deploy.ts)

**RISOLTO.** `execSync` con interpolazione di stringa sostituito con `execFileSync` passando gli argomenti come array. Node esegue il processo direttamente senza shell intermediaria — i caratteri speciali nel subdomain sono ora letterali e non possono essere interpretati come comandi.

**Fix applicato:**
```typescript
execFileSync('npx', ['--yes', 'wrangler@3', 'pages', 'deploy', tempDir,
  `--project-name=${projectName}`, '--branch=main'], { ... });
```

---

### 3. SSRF in fetchImageAsBase64 ⚠️

**Dove:** [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts)

**GIÀ MITIGATO.** È presente una validazione `ALLOWED_DOMAINS` che blocca URL non appartenenti a domini trusted. Il rischio SSRF verso reti interne è contenuto.

**Vulnerabilità residua:** `hostname.endsWith(d)` accetta anche `supabase.co.attacker.com`. Fix:
```typescript
parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
```

**Mancano ancora:** timeout (server può restare appeso su asset lenti) e size limit (asset multi-GB caricati in memoria prima di essere rifiutati). Impatto pratico basso dato il whitelist domini.

---

## ALTO

### 4. Nessun rate limiting 🔴

**Dove:** Tutto il backend

Stato parziale:
- **Login:** nessun limite → brute force illimitato
- **AI generation:** ✅ limite mensile già presente (`max_ai_per_month`)
- **Validazione AI:** ✅ ora richiede credito AI (fix applicato in questa sessione)
- **Deploy:** ✅ rate limit di 30 secondi tra deploy applicato tramite `last_published_at`
- **Creazione progetti/pagine:** nessun limite burst (solo limite totale da piano)

**Da fare:**
- Login: max 5 tentativi/minuto per IP (Vercel Edge Middleware o Supabase Auth config)

---

### 5. Domini custom senza verifica di proprietà 🔴

**Dove:** [`app/actions/deploy.ts`](../app/actions/deploy.ts), `supabase/add_custom_domain.sql`

L'utente può associare qualsiasi dominio al proprio progetto senza dimostrare di esserne il proprietario.

**Rischio:** subdomain takeover, conflitti tra utenti, domini di terzi associati abusivamente.

**Azione:**
1. Generare un token univoco (`sitivetrina-verify-abc123`)
2. L'utente crea un record TXT: `_sitivetrina-verify.dominio.com TXT abc123`
3. Il server verifica il record DNS prima di aggiungere il dominio a Cloudflare
4. Aggiungere campo `domain_verification_token` alla tabella projects

---

## MEDIO

### 6. Nessuna validazione tipo file negli upload 🔴

**Dove:** Storage Supabase, upload immagini

Non c'è validazione server-side del tipo di file caricato. Le policy RLS controllano chi può caricare, ma non cosa.

**Azione:**
- Validazione MIME type server-side: whitelist `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Attenzione SVG: può contenere script JS, valutare se bloccare o sanitizzare
- Size limit server-side (già presente lato client a 5MB)

---

### 7. Policy DELETE mancante sulla tabella projects 🟡

**Dove:** `supabase/schema.sql`

La tabella `projects` ha policy per SELECT, INSERT, UPDATE ma non per DELETE. Funziona perché le Server Actions usano service role key che bypassa RLS. Non è un rischio attivo, ma è una bomba ad orologeria se in futuro viene aggiunta una delete lato client.

**Azione:**
```sql
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

---

## BASSO

### 8. Console.error con dati sensibili 🟡

**Dove:** [`app/actions/deploy.ts`](../app/actions/deploy.ts), [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts)

I `console.error` in produzione possono loggare path del filesystem e messaggi di errore con dettagli interni.

**Azione:** Usare un logger strutturato che maschera i dati sensibili in produzione.

---

### 9. File temporanei non sempre puliti 🟡

**Dove:** [`app/actions/deploy.ts`](../app/actions/deploy.ts)

La temp directory viene pulita nel `finally` block. Se il processo Node.js crasha (OOM, sigkill), i file restano in `/tmp/siti-vetrina-deploy-*`.

**Azione:** Cron job periodico che rimuove directory più vecchie di 1 ora.

---

### 10. AI debug mode in produzione 🟡

**Dove:** [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts)

Se `AI_DEBUG_SAVE_PROMPTS=true`, salva prompt e risposte AI su disco, potenzialmente con dati business degli utenti.

**Azione:** Aggiungere check esplicito `if (process.env.NODE_ENV === 'production') return;` all'inizio della funzione `aiDebugSave`.

---

### 11. customScriptsHead/Body — JS arbitrario nei siti 🟡

**Dove:** `types/editor.ts`, `lib/generate-static.tsx`

Feature intenzionale (gated a Pro/Agency), ma permette agli utenti di iniettare JS arbitrario nei loro siti su dominio `.pages.dev`.

**Azione:** Disclaimer/ToS esplicito all'attivazione, monitoring asincrono dei siti pubblicati.

---

## Cosa è già sicuro

### Autenticazione
- Supabase Auth con email/password
- Middleware protegge le route `/editor/*`
- Tutte le Server Actions verificano `supabase.auth.getUser()` prima di mutare dati
- Session gestita via cookie sicuro da Supabase

### Row-Level Security
- projects: solo propri
- pages: solo di propri progetti
- site_globals: solo di propri progetti
- profiles: solo il proprio
- plans: lettura pubblica (intenzionale)
- storage: lettura pubblica (intenzionale per siti live), scrittura solo propri

### Input sanitization
- Nessun `dangerouslySetInnerHTML` con input utente non controllato
- Contenuti utente renderizzati tramite componenti React (escaping automatico)
- Validazione lunghezza input AI
- Slug e subdomain filtrati (solo caratteri alfanumerici e trattini)

### Separazione client/server
- Le API key sensibili (Cloudflare, Gemini) sono solo in variabili server-side
- Le Server Actions (`'use server'`) non espongono logica al client
- Il Supabase anon key ha accesso limitato dalle policy RLS

---

## Priorità di intervento aggiornata

**Già risolti in questa sessione:**
1. ✅ Command injection in deploy (`execFileSync` con array)
2. ✅ Rate limiting deploy (check `last_published_at` < 30s)
3. ✅ Credito AI per validazione (ora costa 1 credito come la generazione)
   - ⚠️ **DA DECIDERE:** il flusso completo (validazione + generazione) ora consuma 2 crediti invece di 1. La validazione è una chiamata Gemini reale quindi ha senso farla costare, ma va comunicato agli utenti o va rivisto il conteggio (es. non incrementare nella generazione se la validazione è già stata fatta nella stessa sessione).

**Da fare prima del lancio pubblico:**
4. 🔴 Rate limiting login (brute force)
5. 🔴 Validazione tipo file negli upload

**Entro il primo mese:**
6. 🔴 Verifica proprietà domini custom
7. 🔴 Policy DELETE su projects
8. Fix residuo SSRF (`endsWith` → `=== d || endsWith(.d)`)
9. Timeout + size limit in `fetchImageAsBase64`

**Miglioramenti continui:**
10. Logger strutturato
11. Cleanup temp files periodico
12. Disabilitare AI debug in produzione esplicitamente
13. Monitoring script custom per abusi

---

## File coinvolti

| File | Vulnerabilità | Stato |
|------|--------------|-------|
| `app/actions/deploy.ts` | command injection, rate limit, cleanup | ✅ command injection e rate limit risolti |
| `app/actions/ai-generator.ts` | SSRF, debug mode, crediti validazione | ✅ crediti risolti, ⚠️ SSRF mitigato |
| `supabase/schema.sql` | policy DELETE mancante | 🔴 da fare |
| `supabase/add_custom_domain.sql` | nessuna verifica proprietà | 🔴 da fare |
| `lib/supabase/middleware.ts` | rate limiting login | 🔴 da fare |
| `lib/generate-static.tsx` | custom scripts sanitization | 🟡 bassa priorità |
