# Sicurezza — Audit e Azioni Correttive

> Legenda: ✅ Risolto · ⚠️ Già ok / non è un problema reale · 🔴 Da fare · 🟡 Bassa priorità

---

## Risolti

### Command Injection nel deploy ✅
[`app/actions/deploy.ts`](../app/actions/deploy.ts) — `execSync` con stringa interpolata sostituito con `execFileSync` con array di argomenti su Linux/produzione (Vercel). Su Windows locale rimane `execSync` con stringa, protetto da validazione regex `^[a-z0-9-]+$` sul subdomain prima della chiamata. In produzione i caratteri shell nel subdomain non possono mai essere interpretati.

### Rate limiting deploy ✅
[`app/actions/deploy.ts`](../app/actions/deploy.ts) — Controllo su `last_published_at`: se sono passati meno di 30 secondi dall'ultimo deploy, l'action restituisce errore. Usa il campo già esistente, zero dipendenze esterne.

### Crediti AI per validazione ✅
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — `validateProjectDescription` ora richiede autenticazione, controlla `canUseAI` e incrementa `ai_used_this_month` al termine. In precedenza un utente poteva chiamarla infinite volte senza consumare crediti.

> ⚠️ **DA DECIDERE:** il flusso completo (validazione + generazione) consuma ora 2 crediti invece di 1. La validazione chiama Gemini ed ha un costo reale, quindi è corretto farla pagare. Se si vuole che il flusso costi 1 credito totale, occorre non incrementare nella generazione quando è già stata fatta la validazione nella stessa sessione — richiede stato server-side tra le due chiamate.

### Rate limiting login ✅
Configurato nel dashboard Supabase (Auth → Rate Limits). Zero codice.

---

## Da fare
26: 
### Check permessi server-side e bypass limiti piano ✅
- `translatePage` ora verifica `can_multilang` prima di procedere ([`app/actions/pages.ts`](../app/actions/pages.ts)).
- `deployToCloudflare` ora verifica `can_custom_domain` prima di attivare il dominio custom ([`app/actions/deploy.ts`](../app/actions/deploy.ts)).
- I limiti quantitativi (max pagine/articoli/siti) erano già protetti server-side via `canCreatePage`, `canCreateProject`, `canCreateArticle`.
- Trigger PostgreSQL: non implementato — rischio residuo trascurabile perché RLS richiede autenticazione e tutte le mutazioni passano per Server Actions.


41: ### Validazione MIME type upload 🔴

Gli upload passano tutti per `optimizeImageToWebP` che in pratica rigetta qualsiasi file non-immagine durante la conversione — quindi il rischio è già molto contenuto. Manca però una validazione esplicita server-side del tipo di file prima della conversione.

**Azione:** verificare il MIME type del file prima di passarlo a `optimizeImageToWebP`. Whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`. SVG da valutare — può contenere script JS.

### Policy DELETE mancante sulla tabella projects 🔴
`supabase/schema.sql` — La tabella ha policy SELECT, INSERT, UPDATE ma non DELETE. Funziona ora perché le Server Actions usano service role key che bypassa RLS. Se in futuro viene aggiunta una delete lato client senza passare per una Server Action protetta, chiunque potrebbe eliminare progetti altrui.

```sql
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

---

## Bassa priorità

### SSRF in `fetchImageAsBase64` 🟡
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — Già mitigato da whitelist `ALLOWED_DOMAINS`. Vulnerabilità residua: `hostname.endsWith(d)` accetta anche `supabase.co.attacker.com`. Fix esatto:
```typescript
parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
```
Mancano anche timeout (5s) e size limit (10MB). Impatto pratico basso dato il whitelist.

### Domini custom senza verifica di proprietà 🟡
Un utente può associare qualsiasi dominio al proprio progetto senza dimostrarne la proprietà. Richiede generazione token, verifica record DNS TXT, UI dedicata. Alta complessità, bassa priorità fino a che la feature non è diffusa.

### AI debug mode in produzione 🟡
[`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — Se `AI_DEBUG_SAVE_PROMPTS=true`, salva prompt e risposte su disco con dati degli utenti. Aggiungere check esplicito:
```typescript
if (process.env.NODE_ENV === 'production') return;
```

### Console.error con dati interni 🟡
[`app/actions/deploy.ts`](../app/actions/deploy.ts), [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — I log di errore in produzione possono esporre path filesystem e dettagli interni. Considerare un logger strutturato che maschera i dati sensibili.

### File temporanei non sempre puliti 🟡
[`app/actions/deploy.ts`](../app/actions/deploy.ts) — La temp dir viene pulita nel `finally`, ma un crash Node (OOM, sigkill) lascia file in `/tmp/siti-vetrina-deploy-*`. Cron job periodico che rimuove directory più vecchie di 1 ora.

### Script custom utenti (Pro/Agency) 🟡
`lib/generate-static.tsx` — Feature intenzionale e gated a piano Pro/Agency. Gli utenti possono iniettare JS arbitrario nei loro siti. Aggiungere disclaimer ToS esplicito all'attivazione.

---

## Non sono problemi reali

### API Keys nel .env ⚠️
Il progetto è un SaaS privato — gli utenti accedono all'editor dal dominio pubblico, non alla codebase. Il `.env` è locale. Non è una vulnerabilità purché non sia mai committato nel repository.

### Mancanza di rate limiting su creazione progetti/pagine ⚠️
I piani hanno già un limite massimo di progetti e pagine per utente (`max_projects`, `max_pages_per_project`). Un utente non può creare più di quanto il suo piano consente. Il burst rate non è un vettore di attacco reale in questo contesto.

---

## Cosa è già sicuro

- Supabase Auth con email/password, session via cookie sicuro
- Middleware protegge tutte le route `/editor/*`
- Tutte le Server Actions verificano `getUser()` prima di mutare dati
- RLS attiva su tutte le tabelle (projects, pages, site_globals, profiles, storage)
- `user_id` nelle insert sempre dal JWT server-side, mai dal client
- Nessun `dangerouslySetInnerHTML` con input utente non controllato
- Slug e subdomain filtrati (`^[a-z0-9-]+$`)
- API key sensibili (Cloudflare, Gemini) solo in variabili server-side

---

## Priorità di intervento

**Già risolti:** command injection, rate limit deploy, crediti AI validazione, rate limit login

**Fare prima del lancio:**
1. 🔴 **Bypass limiti piano e check server-side** (Critico per il business)
2. 🔴 Policy DELETE su projects (5 minuti, SQL)
3. 🔴 Validazione MIME type upload esplicita

**Entro il primo mese:**
3. 🟡 Fix SSRF `endsWith` → `=== d || endsWith(.d)` + timeout + size limit
4. 🟡 Disabilitare AI debug in produzione esplicitamente
5. 🟡 Verifica proprietà domini custom (solo se la feature diventa self-service diffusa)
