# Piani, Permessi e Limiti — Specifiche Funzionali e Tecniche

> Documento di riferimento per l'implementazione del sistema di piani, limiti e permessi utente.

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Piani e Limiti](#2-piani-e-limiti)
3. [Architettura del Sistema](#3-architettura-del-sistema)
4. [Limiti Numerici — Enforcement](#4-limiti-numerici--enforcement)
5. [Feature Flag — Enforcement](#5-feature-flag--enforcement)
6. [Storage — Tracking e Limiti](#6-storage--tracking-e-limiti)
7. [AI — Tracking e Limiti](#7-ai--tracking-e-limiti)
8. [Override per Utente](#8-override-per-utente)
9. [Controlli Frontend](#9-controlli-frontend)
10. [Problemi di Sicurezza e Gap](#10-problemi-di-sicurezza-e-gap)
11. [File di Riferimento](#11-file-di-riferimento)

---

## 1. Panoramica

Il sistema di piani determina cosa può fare ogni utente: quanti progetti creare, quante pagine, quanto spazio usare, se può accedere a funzionalità avanzate (multilang, dominio custom, script custom, rimozione branding).

I limiti si distinguono in due categorie:

- **Limiti numerici** (`max_projects`, `max_pages_per_project`, `max_ai_per_month`, `max_storage_mb`): verificati sia lato frontend (UX) che lato backend (enforcement reale).
- **Feature flag** (`can_custom_domain`, `can_custom_scripts`, `can_multilang`, `can_remove_branding`): attualmente verificati **solo lato frontend** — nessun enforcement backend.

---

## 2. Piani e Limiti

Definiti in [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) (righe 28-35) nella tabella `plans`.

| Limite | free | starter | pro | agency |
|--------|------|---------|-----|--------|
| **Max progetti** | 1 | 3 | 10 | ∞ |
| **Max pagine/progetto** | 3 | 7 | 25 | ∞ |
| **Storage** | 50 MB | 500 MB | 2 GB | 10 GB |
| **AI generazioni/mese** | 3 | 15 | 50 | 200 |
| **Max articoli/progetto** | 10 | 50 | ∞ | ∞ |
| **Dominio custom** | ✗ | ✓ | ✓ | ✓ |
| **Script custom** | ✗ | ✗ | ✓ | ✓ |
| **Multilinguismo** | ✗ | ✗ | ✓ | ✓ |
| **Rimozione branding** | ✗ | ✗ | ✗ | ✓ |

> `NULL` nel database significa **illimitato** (usato per agency su max_projects, max_pages, max_articles).

---

## 3. Architettura del Sistema

### Tabelle coinvolte

- **`plans`** — definizione dei piani con tutti i limiti
- **`profiles`** — per ogni utente: `plan_id`, `storage_used_bytes`, `ai_generations_this_month`, `ai_month_reset_at`, colonne override (`override_max_projects`, `override_max_pages_per_project`, ecc.)

### RPC `get_user_limits`

**File**: [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) (righe 65-108)

È la funzione centrale. Viene chiamata ogni volta che serve conoscere i limiti di un utente:

1. Legge il piano dell'utente da `profiles JOIN plans`
2. Applica eventuale override per utente con `COALESCE(override, plan_value)`
3. Esegue **lazy reset** del contatore AI: se il mese corrente è diverso da `ai_month_reset_at`, azzera `ai_generations_this_month` e aggiorna il timestamp
4. Restituisce una riga con tutti i campi dell'interfaccia `UserLimits`

```sql
-- Esempio di override applicato
COALESCE(p.override_max_projects, pl.max_projects) AS max_projects
```

### Interfaccia `UserLimits`

**File**: [`lib/permissions.ts`](../lib/permissions.ts) (righe 3-16)

```typescript
export interface UserLimits {
  plan_id: string;
  max_projects: number | null;
  max_pages_per_project: number | null;
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

`null` = illimitato.

### Come si ottengono i limiti

```typescript
// lib/permissions.ts
const limits = await getUserLimits(userId);
// Chiama: supabase.rpc('get_user_limits', { p_user_id: userId })
```

Il `userId` viene sempre recuperato **server-side** tramite `supabase.auth.getUser()` — non è mai passato dal client, impedendo lo spoofing.

---

## 4. Limiti Numerici — Enforcement

### `max_projects`

| Livello | File | Riga | Comportamento |
|---------|------|------|---------------|
| Backend | [`lib/permissions.ts`](../lib/permissions.ts) | 30-50 | `canCreateProject()` conta i progetti esistenti |
| Backend | [`app/actions/projects.ts`](../app/actions/projects.ts) | 31 | Chiamata prima di ogni insert progetto |
| Frontend | [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) | 231-248 | Toast di errore prima di aprire modal/AI |

**Flusso backend:**
```typescript
// lib/permissions.ts
const count = await supabase.from('projects').select(...).eq('user_id', userId);
if (limits.max_projects !== null && count >= limits.max_projects) {
  return { allowed: false, reason: '...' };
}
```

### `max_pages_per_project`

| Livello | File | Riga | Comportamento |
|---------|------|------|---------------|
| Backend | [`lib/permissions.ts`](../lib/permissions.ts) | 52-72 | `canCreatePage()` conta le pagine del progetto |
| Backend | [`app/actions/pages.ts`](../app/actions/pages.ts) | 35 | Chiamata in `createPage()` |
| Backend | [`app/actions/pages.ts`](../app/actions/pages.ts) | 87 | Chiamata anche in `translatePage()` |
| Frontend | [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) | 551-553 | Toast di errore prima di creare pagina |

### `max_ai_per_month`

| Livello | File | Riga | Comportamento |
|---------|------|------|---------------|
| Backend | [`lib/permissions.ts`](../lib/permissions.ts) | 74-88 | `canUseAI()` controlla `ai_used_this_month` |
| Backend | [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) | 261 | Chiamata prima di generare |
| Backend | [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) | 869 | Incrementa contatore dopo generazione riuscita |
| Frontend | [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) | 234 | Toast se limite raggiunto |

**Incremento contatore**: avviene tramite RPC `increment_ai_usage` **dopo** il completamento della generazione (insert progetto + pagine + globals). Se la generazione fallisce a metà, il credito non viene consumato.

**Nota**: `validateProjectDescription` (validazione descrizione prima di generare) **non** incrementa il contatore — è considerata operazione di pre-flight, non di generazione.

**Reset mensile**: lazy, avviene alla prima chiamata a `get_user_limits` nel nuovo mese.

---

## 5. Feature Flag — Enforcement

| Feature | Dove controllata | Backend enforcement |
|---------|-----------------|-------------------|
| `can_custom_domain` | `DomainSection` (UI banner) | **Nessuno** |
| `can_custom_scripts` | `AdvancedSection` (UI banner) | **Nessuno** |
| `can_multilang` | [`components/blocks/sidebar/settings/LanguageSection.tsx`](../components/blocks/sidebar/settings/LanguageSection.tsx) righe 117-149 | **Nessuno** |
| `can_remove_branding` | Non implementato | **Nessuno** |

L'unica protezione è l'interfaccia: se `canMultilang = false`, il pulsante "Aggiungi lingua" non viene mostrato e appare un banner di upgrade. Ma non esiste nessuna server action o RLS policy che impedisce la scrittura diretta.

> **Vedi sezione 10 — Problemi di Sicurezza.**

---

## 6. Storage — Tracking e Limiti

### Tracking automatico (trigger)

**File**: [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) (righe 126-177)

Un trigger PostgreSQL (`on_storage_object_change`) si attiva su ogni INSERT/UPDATE/DELETE nella tabella `storage.objects` per il bucket `project-assets`.

**Path atteso**: `{userId}/{projectId}/{filename}`

```sql
v_project_id := split_part(NEW.name, '/', 2);  -- posizione 2 = projectId
SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
UPDATE public.profiles SET storage_used_bytes = storage_used_bytes + v_new_size WHERE id = v_user_id;
```

| Operazione | Comportamento |
|-----------|---------------|
| INSERT | `+= file_size` |
| UPDATE (upsert) | `+= (new_size - old_size)` |
| DELETE | `-= file_size` (minimo 0) |

**Nota importante**: `metadata->>'size'` può essere NULL al momento del trigger (Supabase lo popola in modo asincrono). In quel caso il size viene considerato 0 e il contatore non viene incrementato — può causare drift.

### Resync manuale

Se il contatore si desincronizza:

```sql
UPDATE profiles p
SET storage_used_bytes = (
  SELECT COALESCE(SUM((so.metadata->>'size')::BIGINT), 0)
  FROM storage.objects so
  JOIN projects pr ON pr.id::text = split_part(so.name, '/', 2)
  WHERE so.bucket_id = 'project-assets'
    AND pr.user_id = p.id
);
```

### Limite storage — NON enforced

Il tracking è implementato, ma **non esiste nessun controllo** che impedisce l'upload quando si supera `max_storage_mb`. La colonna `storage_warning_sent_at` in `profiles` è preparata ma mai utilizzata.

> **Vedi sezione 10 — Problemi di Sicurezza.**

---

## 7. AI — Tracking e Limiti

### Contatore

- **Colonna**: `profiles.ai_generations_this_month` (INTEGER)
- **Reset**: `profiles.ai_month_reset_at` (TIMESTAMPTZ) — aggiornata al reset

### Flusso completo

```
1. Frontend: verifica UI (toast se limite raggiunto)
2. Backend: generateProjectWithAI() chiama canUseAI() → blocca se limite
3. [generazione AI...]
4. Backend: insert progetto + pagine + globals in DB
5. Backend: supabase.rpc('increment_ai_usage') → +1 al contatore
```

### Reset mensile (lazy)

Avviene alla prima chiamata a `get_user_limits` nel nuovo mese:

```sql
IF date_trunc('month', now()) > date_trunc('month', ai_month_reset_at) THEN
  UPDATE profiles SET ai_generations_this_month = 0, ai_month_reset_at = now();
END IF;
```

Non c'è un job cron o scheduled function — il reset avviene solo quando l'utente interagisce con il sistema.

---

## 8. Override per Utente

Ogni utente in `profiles` può avere colonne di override che sovrascrivono i limiti del piano:

| Colonna | Sovrascrive |
|---------|-------------|
| `override_max_projects` | `plans.max_projects` |
| `override_max_pages_per_project` | `plans.max_pages_per_project` |
| `override_max_storage_mb` | `plans.max_storage_mb` |
| `override_max_ai_per_month` | `plans.max_ai_per_month` |

Se `NULL`, viene usato il valore del piano. Se valorizzato, sovrascrive completamente.

Utile per: account demo, utenti beta, accordi commerciali personalizzati.

---

## 9. Controlli Frontend

I controlli frontend sono **solo UX** — mostrano toast o nascondono UI, ma non impediscono chiamate dirette alle server actions.

| Componente | File | Limiti verificati | Tipo controllo |
|-----------|------|------------------|----------------|
| ProjectListClient | [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) righe 231-251 | `max_projects`, `max_ai_per_month` | Toast + blocco apertura modal |
| ProjectDashboardClient | [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) righe 551-553 | `max_pages_per_project` | Toast + blocco submit |
| LanguageSection | [`components/blocks/sidebar/settings/LanguageSection.tsx`](../components/blocks/sidebar/settings/LanguageSection.tsx) righe 117-149 | `can_multilang` | Nasconde pulsante, mostra banner upgrade |
| DomainSection | `components/blocks/sidebar/settings/DomainSection.tsx` | `can_custom_domain` | Banner upgrade |
| AdvancedSection | `components/blocks/sidebar/settings/AdvancedSection.tsx` | `can_custom_scripts` | Banner upgrade |

---

## 10. Problemi di Sicurezza e Gap

### CRITICO — Storage limit non enforced

**Problema**: Il contatore `storage_used_bytes` viene aggiornato automaticamente dal trigger, ma **nessuna server action controlla il limite prima di permettere l'upload**.

**Impatto**: Un utente free (50 MB) può caricare immagini senza limiti finché non viene bloccato manualmente.

**Soluzione**: Aggiungere una funzione `canUploadFile(userId, fileSize)` in `lib/permissions.ts` e chiamarla nell'upload handler prima di procedere con Supabase Storage.

---

### CRITICO — Feature flag senza enforcement backend

**Problema**: `can_custom_domain`, `can_custom_scripts`, `can_multilang`, `can_remove_branding` sono verificati solo nell'UI. Una chiamata diretta alla server action o all'API Supabase bypassa completamente il controllo.

**Impatto**:
- Utente free può salvare un dominio custom su `projects.settings.customDomain` tramite chiamata diretta
- Utente free può aggiungere script custom in `projects.settings`
- Utente free/starter può creare traduzioni di pagine via chiamata diretta a `translatePage`

**Soluzione**:
- Aggiungere verifica `can_multilang` nella server action `translatePage` (TODO già documentato nel codice)
- Aggiungere verifica `can_custom_domain` / `can_custom_scripts` nelle server action di salvataggio settings progetto
- Valutare RLS policy su colonne specifiche di `projects.settings` (più complesso)

---

### MEDIO — `translatePage` non verifica `can_multilang` lato server

**Problema**: La server action `translatePage` in [`app/actions/pages.ts`](../app/actions/pages.ts) verifica `max_pages_per_project` ma **non** verifica `can_multilang`.

**Impatto**: Utente free/starter può creare traduzioni di pagine se chiama direttamente la server action.

**Fix**: Aggiungere all'inizio di `translatePage`:
```typescript
const limits = await getUserLimits(user.id);
if (!limits.can_multilang) return { error: 'Piano non supporta il multilinguismo' };
```

---

### MEDIO — Deploy action senza controlli piano

**Problema**: [`app/actions/deploy.ts`](../app/actions/deploy.ts) non chiama `getUserLimits` e non ha nessun controllo.

**Impatto**: Nessun limite sul numero di deploy. Potenzialmente costoso se il deploy usa risorse esterne (Cloudflare Workers, ecc.).

**Nota**: Potrebbe essere intenzionale (deploy illimitati inclusi in tutti i piani), ma non è documentato.

---

### BASSO — Reset AI mensile lazy

**Problema**: Il reset del contatore AI avviene solo alla prima chiamata a `get_user_limits` nel nuovo mese. Se un utente non accede al sistema nel mese di transizione, il reset avviene alla prima interazione successiva.

**Impatto**: Minimo — leggermente impreciso sul "quando" avviene il reset, ma non crea vantaggi ingiusti.

---

### BASSO — Drift del contatore storage

**Problema**: `metadata->>'size'` può essere NULL al momento dell'INSERT trigger, portando a size = 0 per quel file. Il contatore non viene aggiornato.

**Impatto**: `storage_used_bytes` può essere sottostimato. Già documentato e c'è script di resync.

---

### NON IMPLEMENTATO — Articoli

**Stato**: La colonna `max_articles_per_project` esiste nei piani e in `UserLimits`, ma non esiste né `canCreateArticle()` né nessun enforcement frontend o backend. Template per l'implementazione futura disponibile in [`supabase/PIANI_E_PERMESSI.md`](../supabase/PIANI_E_PERMESSI.md).

---

### NON IMPLEMENTATO — Notifiche storage

**Stato**: La colonna `storage_warning_sent_at` in `profiles` è preparata per notifiche email all'"80% dello storage usato", ma non è mai impostata né esiste codice che la utilizzi.

---

## Riepilogo Enforcement

| Limite | Tracking | Frontend | Backend | Aggirabile |
|--------|---------|---------|---------|-----------|
| `max_projects` | ✓ DB count | ✓ Toast | ✓ `canCreateProject()` | No |
| `max_pages_per_project` | ✓ DB count | ✓ Toast | ✓ `canCreatePage()` | No |
| `max_ai_per_month` | ✓ Colonna profilo | ✓ Toast | ✓ `canUseAI()` | No |
| `max_storage_mb` | ✓ Trigger storage | ✗ Nessuno | **✗ Nessuno** | **Sì** |
| `can_custom_domain` | ✓ Piani | ✓ Banner UI | **✗ Nessuno** | **Sì** |
| `can_custom_scripts` | ✓ Piani | ✓ Banner UI | **✗ Nessuno** | **Sì** |
| `can_multilang` | ✓ Piani | ✓ Nascondi UI | **✗ Nessuno** | **Sì** |
| `can_remove_branding` | ✓ Piani | ✗ Non impl. | **✗ Nessuno** | **Sì** |

---

## 11. File di Riferimento

### Database
- [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) — Definizione piani, RPC `get_user_limits`, `increment_ai_usage`, trigger storage
- [`supabase/PIANI_E_PERMESSI.md`](../supabase/PIANI_E_PERMESSI.md) — Documentazione operativa piani (legacy, da allineare con questo documento)

### Backend
- [`lib/permissions.ts`](../lib/permissions.ts) — `UserLimits`, `getUserLimits()`, `canCreateProject()`, `canCreatePage()`, `canUseAI()`
- [`app/actions/projects.ts`](../app/actions/projects.ts) — `canCreateProject()` applicato
- [`app/actions/pages.ts`](../app/actions/pages.ts) — `canCreatePage()` applicato in `createPage()` e `translatePage()`
- [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — `canUseAI()` + `increment_ai_usage` applicati
- [`app/actions/deploy.ts`](../app/actions/deploy.ts) — Nessun controllo piano

### Frontend
- [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) — Controlli `max_projects`, `max_ai_per_month`
- [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) — Controllo `max_pages_per_project`, passa `canMultilang`
- [`components/blocks/sidebar/settings/LanguageSection.tsx`](../components/blocks/sidebar/settings/LanguageSection.tsx) — Controllo `can_multilang`
