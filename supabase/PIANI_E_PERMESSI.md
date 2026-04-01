# Sistema Piani e Permessi

## Struttura generale

I permessi utente si basano su **due livelli**:

1. **Piano** (`plans`) — limiti condivisi per categoria di utente
2. **Override** (`profiles`) — eccezioni per singolo utente che sovrascrivono il piano

La logica è centralizzata nella funzione Postgres `get_user_limits(user_id)` e nel file TypeScript `lib/permissions.ts`. I controlli avvengono **esclusivamente server-side** tramite i server actions in `app/actions/`.

---

## Tabella `plans`

Ogni piano ha:

| Campo | Tipo | Note |
|---|---|---|
| `id` | TEXT PK | `free`, `starter`, `pro`, `agency` |
| `max_projects` | INTEGER | NULL = illimitato |
| `max_pages_per_project` | INTEGER | NULL = illimitato |
| `max_storage_mb` | INTEGER | NULL = illimitato |
| `max_ai_per_month` | INTEGER | Reset automatico ogni mese |
| `max_articles_per_project` | INTEGER | NULL = illimitato (struttura pronta, logica da implementare) |
| `can_custom_domain` | BOOLEAN | Permesso dominio personalizzato |
| `can_custom_scripts` | BOOLEAN | Permesso script custom in head/body |
| `can_multilang` | BOOLEAN | Permesso sito multilingua |
| `can_remove_branding` | BOOLEAN | Permesso rimozione "Powered by" |

### Valori attuali

| Piano | Siti | Pagine/sito | Storage | AI/mese | Articoli/sito | Domain | Scripts | Multilingua | No branding |
|---|---|---|---|---|---|---|---|---|---|
| free | 1 | 3 | 50 MB | 3 | 10 | ✗ | ✗ | ✗ | ✗ |
| starter | 3 | 7 | 500 MB | 15 | 50 | ✓ | ✗ | ✗ | ✗ |
| pro | 10 | 25 | 2 GB | 50 | ∞ | ✓ | ✓ | ✓ | ✗ |
| agency | ∞ | ∞ | 10 GB | 200 | ∞ | ✓ | ✓ | ✓ | ✓ |

### Modificare i limiti di un piano

Su Supabase SQL Editor:

```sql
-- Esempio: aumentare il limite siti del piano starter a 5
UPDATE plans SET max_projects = 5 WHERE id = 'starter';

-- Esempio: rendere illimitato lo storage per agency
UPDATE plans SET max_storage_mb = NULL WHERE id = 'agency';

-- Esempio: aggiungere un nuovo piano
INSERT INTO plans (id, name, description, max_projects, max_pages_per_project, max_storage_mb, max_ai_per_month, max_articles_per_project, can_custom_domain, can_custom_scripts, can_multilang, can_remove_branding, sort_order)
VALUES ('enterprise', 'Enterprise', 'Piano custom', NULL, NULL, NULL, NULL, NULL, true, true, true, true, 4);
```

---

## Tabella `profiles` — colonne rilevanti

| Campo | Tipo | Note |
|---|---|---|
| `plan_id` | TEXT FK → plans | Piano assegnato all'utente, default `free` |
| `override_max_projects` | INTEGER | Se valorizzato, sovrascrive il piano |
| `override_max_pages_per_project` | INTEGER | Se valorizzato, sovrascrive il piano |
| `override_max_storage_mb` | INTEGER | Se valorizzato, sovrascrive il piano |
| `override_max_ai_per_month` | INTEGER | Se valorizzato, sovrascrive il piano |
| `override_max_articles_per_project` | INTEGER | Se valorizzato, sovrascrive il piano |
| `storage_used_bytes` | BIGINT | Aggiornato automaticamente da trigger su `storage.objects` |
| `storage_warning_sent_at` | TIMESTAMP | Pronto per notifiche email future all'80% di utilizzo |
| `ai_generations_this_month` | INTEGER | Reset automatico ogni mese da `get_user_limits()` |
| `ai_month_reset_at` | TIMESTAMP | Data dell'ultimo reset mensile |

> Le colonne `max_ai_generations` e `ai_generations_used` sono rimosse — eseguire `cleanup_legacy_ai_column.sql` su Supabase.

---

## Assegnare un piano a un utente

```sql
UPDATE profiles SET plan_id = 'pro' WHERE id = 'uuid-utente';
```

---

## Override di un singolo utente

Gli override hanno la precedenza sul piano. Utile per utenti VIP, beta tester, eccezioni commerciali.

```sql
-- Utente con piano free ma con 5 siti consentiti
UPDATE profiles
SET override_max_projects = 5
WHERE id = 'uuid-utente';

-- Utente con piano starter ma AI illimitata questo mese
UPDATE profiles
SET override_max_ai_per_month = NULL
WHERE id = 'uuid-utente';

-- Rimuovere un override (torna a usare il piano)
UPDATE profiles
SET override_max_projects = NULL
WHERE id = 'uuid-utente';
```

---

## Come funziona `get_user_limits()`

La funzione Postgres applica la logica `COALESCE(override, valore_piano)` per ogni campo:
- Se l'override è `NULL` → usa il valore del piano
- Se l'override è valorizzato → usa quello

Viene chiamata da `lib/permissions.ts` → `getUserLimits(userId)`, che è la base di tutte le funzioni di controllo.

---

## Conteggio utilizzi AI

Il processo di generazione AI si compone internamente di **due chiamate al modello** (`validateProjectDescription` + `generateProjectWithAI`), ma viene conteggiato come **1 solo utilizzo**. Il contatore viene incrementato una volta sola, alla fine di `generateProjectWithAI`, e solo se la generazione ha avuto successo. `validateProjectDescription` non viene tracciata.

## Reset mensile AI

Il contatore `ai_generations_this_month` usa un **reset lazy**: non si azzera a mezzanotte del primo del mese, ma si azzera la prima volta che `get_user_limits()` viene chiamata nel nuovo mese (es. quando l'utente apre il sito o genera con l'AI).

**Pro**: zero infrastruttura aggiuntiva, funziona sempre.  
**Contro**: se un utente non accede per mesi il contatore rimane sporco nel DB, ma non causa problemi funzionali perché il reset avviene prima del check.

### Reset puntuale opzionale (futuro)

Se in futuro serve un reset preciso (es. per email "il tuo piano si è rinnovato"), aggiungere una Supabase Edge Function schedulata il primo di ogni mese:

```sql
UPDATE profiles
SET ai_generations_this_month = 0,
    ai_month_reset_at = date_trunc('month', now())
WHERE date_trunc('month', ai_month_reset_at) < date_trunc('month', now());
```

---

## Storage: perché in bytes

Lo storage è tracciato in `storage_used_bytes` (BIGINT) e non in MB perché i file hanno dimensioni molto variabili (una logo da 8 KB vs un'immagine da 4 MB). Arrotondare in MB causerebbe drift significativo sul contatore.

La conversione in MB avviene solo nel confronto finale dentro `get_user_limits()`:

```sql
storage_used_bytes / (1024 * 1024) >= max_storage_mb
```

Il contatore è aggiornato automaticamente da un **trigger su `storage.objects`** ad ogni upload e delete — non richiede codice aggiuntivo nell'app.

### Drift del contatore storage

Il trigger può desincronizzarsi in caso di errori interni Supabase. Per correggere eventuali drift eseguire il ricalcolo reale:

```sql
UPDATE profiles p
SET storage_used_bytes = (
  SELECT COALESCE(SUM((so.metadata->>'size')::BIGINT), 0)
  FROM storage.objects so
  JOIN projects pr ON pr.id::text = split_part(so.name, '/', 1)
  WHERE so.bucket_id = 'project-assets'
    AND pr.user_id = p.id
);
```

Questo può essere eseguito manualmente o schedulato come cron settimanale su Supabase.

---

## Flusso di un check permesso

```
Server Action (es. createProject)
  └─ canCreateProject(userId)          ← lib/permissions.ts
       └─ getUserLimits(userId)
            └─ get_user_limits()       ← funzione Postgres
                 └─ COALESCE(override, piano)
```

---

## Sicurezza: dove avvengono i controlli

I check sui permessi sono su **due livelli**:

1. **Frontend (UX)** — i bottoni "Crea con IA", "Nuovo sito", "+ Nuova pagina" mostrano subito un toast di errore se il limite è raggiunto, prima di aprire qualsiasi modal. Questo è solo per esperienza utente, non è una garanzia di sicurezza.

2. **Server-side (enforcement reale)** — i server actions `createProject`, `createPage` e `generateProjectWithAI` rifiutano la richiesta indipendentemente da cosa fa il client. L'utente non può bypassarli perché sono marcati `'use server'` e girano esclusivamente sul server Next.js. `user.id` viene sempre da `supabase.auth.getUser()` lato server, mai passato dal client.

La RLS di Supabase costituisce una terza linea di difesa a livello database.

---

## Feature flags: multilingua e dominio personalizzato

`LanguageSection` e `DomainSection` ricevono i flag `canMultilang` e `canCustomDomain` dalle page server (`app/editor/[projectId]/page.tsx`) tramite `getUserLimits`. Se il piano non include la feature, mostrano un banner informativo al posto della UI di configurazione.

---

## File coinvolti

| File | Ruolo |
|---|---|
| `supabase/permissions_system.sql` | Migration principale — tabelle, funzioni, trigger. **Da eseguire su Supabase** |
| `supabase/cleanup_legacy_ai_column.sql` | Rimuove `max_ai_generations` e `ai_generations_used` legacy. **Da eseguire su Supabase** |
| `supabase/fix_storage_security.sql` | Crea bucket `project-assets` e policy RLS storage (lettura pubblica, write solo owner). Già eseguito in passato — non rieseguire a meno di reset |
| `lib/permissions.ts` | Utility server-side: `getUserLimits`, `canCreateProject`, `canCreatePage`, `canUseAI` |
| `app/editor/page.tsx` | Carica `getUserLimits` e li passa a `ProjectListClient` |
| `app/editor/[projectId]/page.tsx` | Carica `getUserLimits` e li passa a `ProjectDashboardClient` |
| `app/actions/projects.ts` | Server action creazione sito — check piano server-side |
| `app/actions/pages.ts` | Server action creazione pagina — check piano server-side |
| `app/actions/ai-generator.ts` | Generazione AI — check piano e incremento mensile |
| `components/blocks/sidebar/settings/LanguageSection.tsx` | Accetta `canMultilang`, blocca UI se false |
| `components/blocks/sidebar/settings/DomainSection.tsx` | Accetta `canCustomDomain`, blocca UI se false |

---

## Aggiungere un nuovo controllo in futuro

Esempio per gli articoli (quando verranno implementati):

1. Aggiungere `canCreateArticle(userId, projectId)` in `lib/permissions.ts` sul modello di `canCreatePage`
2. Creare `app/actions/articles.ts` con `'use server'` e chiamare `canCreateArticle` prima dell'insert
3. Non serve toccare il DB — `max_articles_per_project` e l'override sono già presenti
