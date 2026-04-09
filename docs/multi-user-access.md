# Multi-User Access — Analisi di Impatto e Specifiche

> Analisi di cosa comporta aggiungere la funzionalità di condivisione di un progetto con più utenti, con ruoli differenziati.

---

## Indice

1. [Panoramica e Modello dei Ruoli](#1-panoramica-e-modello-dei-ruoli)
2. [Impatto sul Database](#2-impatto-sul-database)
3. [Impatto su RLS e Sicurezza](#3-impatto-su-rls-e-sicurezza)
4. [Impatto sulle Server Actions](#4-impatto-sulle-server-actions)
5. [Impatto sul Sistema di Permessi e Piani](#5-impatto-sul-sistema-di-permessi-e-piani)
6. [Impatto sullo Storage](#6-impatto-sullo-storage)
7. [Impatto sul Frontend](#7-impatto-sul-frontend)
8. [Flusso di Invito](#8-flusso-di-invito)
9. [Impatto su Piani e Feature Flag](#9-impatto-su-piani-e-feature-flag)
10. [Concorrenza — Rischi e Strategie](#10-concorrenza--rischi-e-strategie)
11. [Ordine di Implementazione Consigliato](#11-ordine-di-implementazione-consigliato)
12. [File Impattati — Riepilogo](#12-file-impattati--riepilogo)

---

## 1. Panoramica e Modello dei Ruoli

Oggi ogni progetto ha un **unico proprietario** (`projects.user_id`). Tutta la RLS, il controllo dei permessi nelle Server Actions e il path dello storage sono costruiti su questa assunzione 1:1.

L'obiettivo è permettere a un proprietario di **invitare altri utenti** su un singolo progetto, assegnando un ruolo che determini cosa possono fare.

### Ruoli proposti

| Ruolo | Visualizza editor | Modifica blocchi/pagine | Deploy | Impostazioni progetto | Gestione articoli | Invita collaboratori |
|-------|:-----------------:|:-----------------------:|:------:|:---------------------:|:-----------------:|:--------------------:|
| `owner` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `editor` | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| `articles_manager` | ✓ (read-only) | ✗ | ✗ | ✗ | ✓ | ✗ |
| `viewer` | ✓ (read-only) | ✗ | ✗ | ✗ | ✗ | ✗ |

> **Nota**: `articles_manager` è pensato per la funzionalità articoli non ancora implementata. Al momento può essere modellato ma non avrà enforcement reale fino all'implementazione degli articoli. `viewer` è utile per clienti che devono approvare i contenuti prima del deploy.

Il ruolo `owner` non si assegna via invito — è sempre il creatore del progetto (`projects.user_id`).

---

## 2. Impatto sul Database

### 2.1 Nuova tabella: `project_members`

```sql
CREATE TABLE project_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('editor', 'articles_manager', 'viewer')),
  invited_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, user_id)   -- un utente non può avere due ruoli sullo stesso progetto
);
```

### 2.2 Nuova tabella: `project_invitations`

Necessaria per gestire inviti pendenti (l'utente invitato potrebbe non avere ancora un account).

```sql
CREATE TABLE project_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('editor', 'articles_manager', 'viewer')),
  invited_by    UUID NOT NULL REFERENCES auth.users(id),
  token         TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at   TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, email)   -- un solo invito pendente per email per progetto
);
```

### 2.3 Nessuna modifica alla tabella `projects`

`projects.user_id` rimane il **proprietario** e non cambia. Questo preserva la retrocompatibilità con tutta la logica esistente di limiti e piano.

### 2.4 Relazioni aggiornate

```
auth.users
  ├── (1:1) profiles
  │
  ├── (1:N) projects  [come owner]
  │          ├── (1:N) pages
  │          ├── (1:N) site_globals
  │          └── (1:N) project_members  ← NUOVO
  │                      └── → auth.users [come collaboratore]
  │
  └── (1:N) project_members  [come collaboratore]
```

### 2.5 Funzione helper SQL consigliata

Utile per le RLS policy — evita subquery ridondanti:

```sql
CREATE OR REPLACE FUNCTION get_project_role(p_project_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM project_members
  WHERE project_id = p_project_id AND user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## 3. Impatto su RLS e Sicurezza

Questa è la parte più delicata: **tutte le policy RLS esistenti assumono ownership** e devono essere estese.

### 3.1 Tabella `projects`

**Oggi:**
```sql
-- SELECT / UPDATE
USING (auth.uid() = user_id)
```

**Dopo:**
```sql
-- SELECT: owner o qualsiasi membro
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = id AND user_id = auth.uid()
  )
)

-- UPDATE: solo owner (le impostazioni progetto rimangono solo all'owner)
USING (auth.uid() = user_id)

-- DELETE: solo owner
USING (auth.uid() = user_id)
```

> **Attenzione**: se in futuro si vuole permettere anche agli `editor` di modificare le impostazioni di base (es. nome progetto), la policy UPDATE va differenziata.

### 3.2 Tabella `pages`

**Oggi:**
```sql
USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
)
```

**Dopo — SELECT:**
```sql
USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = pages.project_id AND user_id = auth.uid()
  )
)
```

**Dopo — INSERT/UPDATE/DELETE:** solo `owner` e `editor` (non `viewer`, non `articles_manager`):
```sql
WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = pages.project_id AND user_id = auth.uid()
      AND role = 'editor'
  )
)
```

### 3.3 Tabella `site_globals`

Stessa logica di `pages` — lettura allargata a tutti i membri, scrittura solo `owner` e `editor`.

### 3.4 Nuova tabella `project_members` — RLS

```sql
-- SELECT: owner può vedere i suoi membri; i membri possono vedere gli altri membri dello stesso progetto
USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  OR user_id = auth.uid()
)

-- INSERT (invitare): solo owner
WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
)

-- DELETE (rimuovere): owner può rimuovere chiunque; un membro può rimuovere se stesso
USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  OR user_id = auth.uid()
)
```

### 3.5 Nuova tabella `project_invitations` — RLS

```sql
-- SELECT: owner può vedere i suoi inviti; l'invitato può vedere il proprio via token (gestito in server action)
-- INSERT: solo owner (tramite Server Action)
-- UPDATE (accept): gestito via Server Action con service_role (il token è il segreto)
-- DELETE: owner può annullare inviti pendenti
```

> **Raccomandazione**: le azioni di invito e accettazione dovrebbero passare tutte per Server Actions con `service_role`, non per RLS diretta, per poter gestire il caso dell'utente non ancora registrato.

---

## 4. Impatto sulle Server Actions

### 4.1 Pattern attuale

Tutte le Server Actions verificano ownership così:

```typescript
// Esempio da app/actions/pages.ts
const { data: project } = await supabase
  .from('projects')
  .select('id, user_id')
  .eq('id', projectId)
  .eq('user_id', user.id)  // ← controllo ownership diretto
  .single();

if (!project) return { error: 'Progetto non trovato' };
```

Questo blocca già qualsiasi accesso ai collaboratori anche se la RLS fosse aggiornata.

### 4.2 Nuovo helper da aggiungere in [`lib/permissions.ts`](../lib/permissions.ts)

```typescript
export async function getProjectRole(
  userId: string,
  projectId: string
): Promise<'owner' | 'editor' | 'articles_manager' | 'viewer' | null> {
  const supabase = await createClient();

  // Verifica se è owner
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (project?.user_id === userId) return 'owner';

  // Verifica se è membro
  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  return (member?.role as 'editor' | 'articles_manager' | 'viewer') ?? null;
}

export function canEditProject(role: string | null): boolean {
  return role === 'owner' || role === 'editor';
}

export function canDeployProject(role: string | null): boolean {
  return role === 'owner' || role === 'editor';
}

export function canManageArticles(role: string | null): boolean {
  return role === 'owner' || role === 'editor' || role === 'articles_manager';
}
```

### 4.3 [`app/actions/pages.ts`](../app/actions/pages.ts) — `createPage`, `updatePage`, `deletePage`, `translatePage`

**Modifica**: sostituire il check `.eq('user_id', user.id)` con una verifica di ruolo:

```typescript
// Prima
const { data: project } = await supabase
  .from('projects').select('id').eq('id', projectId).eq('user_id', user.id).single();
if (!project) return { error: 'Non autorizzato' };

// Dopo
const role = await getProjectRole(user.id, projectId);
if (!canEditProject(role)) return { error: 'Non autorizzato' };
```

**Attenzione su `translatePage`**: oltre all'ownership check, verifica `can_multilang`. Con i collaboratori, `can_multilang` va verificato sul piano del **proprietario** del progetto (non del collaboratore). Serve recuperare l'owner del progetto e chiamare `getUserLimits(ownerId)`.

### 4.4 [`app/actions/projects.ts`](../app/actions/projects.ts) — `updateProjectSettings`

Le impostazioni progetto (tema, SEO, dominio custom) dovrebbero restare **solo all'owner**. Mantenere il check `.eq('user_id', user.id)` per `updateProjectSettings`.

`createProject` non cambia: crea sempre un progetto dell'utente corrente.

Aggiungere nuove funzioni:
- `inviteMember(projectId, email, role)` — crea invitation
- `removeMember(projectId, memberId)` — rimuove membro
- `updateMemberRole(projectId, memberId, newRole)` — cambia ruolo
- `acceptInvitation(token)` — l'invitato accetta

### 4.5 [`app/actions/deploy.ts`](../app/actions/deploy.ts) — `deployToCloudflare`

**Modifica**: aggiornare il check di ownership:

```typescript
// Prima
const { data: project } = await supabase
  .from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single();

// Dopo
const role = await getProjectRole(user.id, projectId);
if (!canDeployProject(role)) return { error: 'Non autorizzato' };
const { data: project } = await supabase
  .from('projects').select('*').eq('id', projectId).single();
```

**Attenzione critica**: `deployToCloudflare` usa `project.user_id` per costruire i path degli asset in Supabase Storage:

```typescript
// In deploy.ts — scarica asset da storage
`project-assets/${project.user_id}/${projectId}/${filename}`
```

Questo rimane corretto dopo la modifica: il path usa sempre l'`user_id` del **proprietario**, non del collaboratore che sta eseguendo il deploy.

### 4.6 [`app/actions/ai-generator.ts`](../app/actions/ai-generator.ts) — `generateProjectWithAI`

La generazione AI crea sempre un nuovo progetto di proprietà dell'utente corrente — **non cambia**. Un collaboratore non può generare AI su un progetto altrui (creerebbe un progetto suo).

Se in futuro si volesse permettere la generazione di **pagine** AI su progetti altrui (tramite un'apposita server action), andrebbe aggiunto il check di ruolo `editor`.

---

## 5. Impatto sul Sistema di Permessi e Piani

### 5.1 A quale piano si applicano i limiti?

**Decisione da prendere**: quando un `editor` crea una pagina su un progetto altrui, i limiti verificati sono quelli del **proprietario del progetto** o quelli dell'editor?

**Raccomandazione**: usare sempre il piano del **proprietario del progetto**. Motivazioni:
- Il progetto "consuma" risorse del proprietario (storage, pagine, etc.)
- È più semplice da implementare e da spiegare agli utenti
- Il proprietario ha il controllo su cosa può fare il suo sito

**Implementazione**: nelle Server Actions, dopo aver identificato il progetto, recuperare l'`user_id` dell'owner e passarlo a `canCreatePage(ownerId, projectId)`.

```typescript
// Esempio in createPage
const { data: project } = await supabase
  .from('projects').select('id, user_id').eq('id', projectId).single();

const role = await getProjectRole(user.id, projectId);
if (!canEditProject(role)) return { error: 'Non autorizzato' };

// Verifica limiti sull'owner, non sul collaboratore
const pageCheck = await canCreatePage(project.user_id, projectId);
if (!pageCheck.allowed) return { error: pageCheck.reason };
```

### 5.2 Collaborazione come feature flag di piano

La possibilità di invitare collaboratori dovrebbe essere **gated da piano**. Aggiungere alla tabella `plans`:

```sql
ALTER TABLE plans ADD COLUMN can_collaborate BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN max_collaborators INTEGER DEFAULT 0;
-- NULL = illimitato
```

Valori suggeriti:

| Piano | `can_collaborate` | `max_collaborators` |
|-------|:-----------------:|:-------------------:|
| free | ✗ | 0 |
| starter | ✗ | 0 |
| pro | ✓ | 3 |
| agency | ✓ | NULL (∞) |

Aggiornare `get_user_limits` per restituire anche questi valori e aggiungere `canCollaborate` e `canInviteMoreCollaborators` all'interfaccia `UserLimits` in [`lib/permissions.ts`](../lib/permissions.ts).

### 5.3 Funzione `get_user_limits` — aggiornamento

La RPC [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) deve essere aggiornata per:
1. Restituire `can_collaborate` e `max_collaborators` (con logica `COALESCE(override, plan_value)`)
2. Aggiungere eventuale `override_max_collaborators` a `profiles`

---

## 6. Impatto sullo Storage

### 6.1 Struttura path attuale

```
project-assets/{userId}/{projectId}/{filename}
```

Dove `userId` è sempre il **proprietario** del progetto.

### 6.2 Problema: RLS storage blocca upload dei collaboratori

Le policy RLS attuali permettono la scrittura solo nella propria cartella:

```sql
-- Policy storage attuale (write)
(auth.uid()::text) = (storage.foldername(name))[1]
-- Equivale a: il primo segmento del path deve essere l'uid dell'utente corrente
```

Un `editor` collaboratore non può scrivere in `{ownerId}/{projectId}/` perché il primo segmento è l'userId dell'owner, non il suo.

### 6.3 Soluzioni possibili

**Opzione A — Aggiornare la RLS storage (consigliata)**

```sql
-- Nuova policy write: owner della cartella O membro del progetto
CREATE POLICY "project members can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  -- Owner classico
  (auth.uid()::text) = (storage.foldername(name))[1]
  OR
  -- Collaboratore editor: il path è {ownerId}/{projectId}/... e l'utente è editor del progetto
  EXISTS (
    SELECT 1 FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE p.id::text = (storage.foldername(name))[2]
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
  )
);
```

**Opzione B — Upload sempre attraverso Server Action con service role**

Gli editor uploadano attraverso una Server Action che verifica il ruolo e poi esegue l'upload con `service_role` key. Più sicuro, ma meno flessibile e più lento (round-trip extra).

> **Raccomandazione**: Opzione A per semplicità, con l'accortezza di testare la RLS storage a fondo.

### 6.4 Pulizia storage (`cleanup-storage`)

La Edge Function [`supabase/functions/cleanup-storage/index.ts`](../supabase/functions/cleanup-storage/index.ts) estrae `userId` dal path:

```typescript
// Primo segmento del path = userId dell'owner
const userId = path.split('/')[0];
```

Questo **non cambia** — il path continua a usare l'userId dell'owner. La Edge Function non ha bisogno di aggiornamenti.

---

## 7. Impatto sul Frontend

### 7.1 [`app/editor/page.tsx`](../app/editor/page.tsx) e [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx)

**Oggi**: carica solo `projects` dove `user_id = auth.uid()`.

**Dopo**: deve caricare anche i progetti dove l'utente è membro. La query diventa:

```typescript
// Carica progetti propri
const { data: ownedProjects } = await supabase
  .from('projects').select('*').eq('user_id', user.id);

// Carica progetti condivisi
const { data: sharedMembers } = await supabase
  .from('project_members')
  .select('role, project:projects(*)')
  .eq('user_id', user.id);
```

Oppure semplificato con una view o una RPC dedicata.

Nella UI: mostrare sezioni separate "I miei siti" e "Condivisi con me", o un badge/indicatore di ruolo sulle card.

**File impattato**: [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) — rilevante in particolare nelle righe che controllano `max_projects` e `max_ai_per_month` (righe 231-251): queste verifiche si applicano solo alla creazione di **propri** progetti, non ai progetti condivisi.

### 7.2 [`app/editor/[projectId]/page.tsx`](../app/editor/%5BprojectId%5D/page.tsx) e [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx)

Oggi recupera il progetto con `.eq('user_id', user.id)`. Deve aggiornare per consentire l'accesso ai membri, passando anche il ruolo al Client Component.

Il `ProjectDashboardClient` deve ricevere `userRole: 'owner' | 'editor' | 'articles_manager' | 'viewer'` come prop e:
- Nascondere "Impostazioni progetto" a non-owner
- Mostrare il pulsante "Nuova pagina" solo a `editor`/`owner`
- Mostrare badge collaboratori nella dashboard
- Mostrare sezione "Condivisione" nelle impostazioni (solo owner)

### 7.3 [`app/editor/[projectId]/[pageId]/EditorClient.tsx`](../app/editor/%5BprojectId%5D/%5BpageId%5D/EditorClient.tsx)

Deve ricevere `userRole` e:
- In modalità `viewer`/`articles_manager`: disabilitare drag & drop, aggiunta/rimozione blocchi, inline editing
- Nascondere la sidebar di configurazione (blocchi + impostazioni) ai `viewer`
- Nascondere il pulsante "Pubblica" ai `viewer`/`articles_manager`

> **Complessità**: l'editor attualmente non ha un concetto di "modalità read-only". Va aggiunto uno stato globale `isReadOnly` allo store in [`store/useEditorStore.ts`](../store/useEditorStore.ts), o passato come prop attraverso la catena di componenti.

### 7.4 Nuova sezione impostazioni: `CollaboratorsSection`

**File da creare**: `components/blocks/sidebar/settings/CollaboratorsSection.tsx`

Visibile solo all'owner, deve mostrare:
- Lista collaboratori attuali con ruolo e pulsante rimozione
- Form invito via email con selezione ruolo
- Lista inviti pendenti con pulsante annulla
- Lock/upgrade banner se `!can_collaborate`

Integrare in [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx) nella tab Impostazioni.

### 7.5 Nuova card: indicatore collaborazione

In [`components/editor/cards/ProjectCard.tsx`](../components/editor/cards/ProjectCard.tsx): mostrare un'icona "team" se il progetto ha collaboratori, o un badge "Condiviso" se l'utente sta visualizzando un progetto altrui.

---

## 8. Flusso di Invito

### 8.1 Invito tramite email

```
1. Owner apre CollaboratorsSection → inserisce email + ruolo → chiama inviteMember()
2. Server Action:
   a. Verifica che owner sia su piano con can_collaborate
   b. Verifica max_collaborators non superato
   c. Crea record in project_invitations con token casuale
   d. Invia email (Supabase Auth o provider email esterno) con link:
      https://app.sitivetrina.it/inviti/[token]
3. L'invitato clicca il link:
   a. Se non autenticato: redirect a login/signup, poi ritorna al link
   b. Se autenticato: Server Action acceptInvitation(token):
      - Verifica token non scaduto (expires_at > now())
      - Verifica invito non già accettato
      - Verifica che l'email dell'utente corrisponda a quella dell'invito
      - Crea record in project_members
      - Aggiorna project_invitations.accepted_at
      - Redirect alla dashboard del progetto
```

### 8.2 Pagina `/inviti/[token]`

**File da creare**: `app/inviti/[token]/page.tsx`

Server Component che:
1. Recupera il progetto dall'invito (mostra nome progetto e chi ha invitato)
2. Se l'utente non è loggato: mostra CTA login/signup
3. Se loggato: mostra pulsante "Accetta invito" che chiama `acceptInvitation`

### 8.3 Gestione edge case

| Caso | Comportamento |
|------|---------------|
| Invito per utente non ancora registrato | Token valido, alla registrazione viene presentato l'invito |
| Owner invita se stesso | Bloccare lato server |
| Email già membro del progetto | Errore "Utente già collaboratore" |
| Invito scaduto (7 giorni) | Errore "Invito scaduto", l'owner può reinviare |
| Owner supera `max_collaborators` | Errore piano |
| Owner revoca invito pendente | DELETE su project_invitations |
| Collaboratore lascia il progetto | DELETE su project_members (self-removal) |
| Progetto eliminato | CASCADE su project_members e project_invitations |

---

## 9. Impatto su Piani e Feature Flag

### 9.1 Nuovi campi da aggiungere alla tabella `plans`

```sql
ALTER TABLE plans ADD COLUMN can_collaborate BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN max_collaborators INTEGER DEFAULT 0;
```

### 9.2 Nuovi campi da aggiungere a `profiles` (override)

```sql
ALTER TABLE profiles ADD COLUMN override_max_collaborators INTEGER;
```

### 9.3 Aggiornamento `get_user_limits`

La RPC [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) deve restituire anche:

```sql
COALESCE(p.override_max_collaborators, pl.max_collaborators) AS max_collaborators,
pl.can_collaborate AS can_collaborate
```

### 9.4 Aggiornamento `UserLimits` in [`lib/permissions.ts`](../lib/permissions.ts)

```typescript
export interface UserLimits {
  // ... campi esistenti ...
  can_collaborate: boolean;        // NUOVO
  max_collaborators: number | null; // NUOVO — null = illimitato
}
```

---

## 10. Concorrenza — Rischi e Strategie

Con un solo utente per progetto la concorrenza è quasi impossibile. Con più editor sullo stesso progetto diventa un problema reale e da progettare esplicitamente. Di seguito tutti i punti critici in ordine di gravità.

---

### 10.1 CRITICO — Last-write-wins sul salvataggio pagina

**Problema**

Il salvataggio dei blocchi in [`store/useEditorStore.ts`](../store/useEditorStore.ts) esegue un **replace totale** del campo `pages.blocks`:

```typescript
// saveBlocks() — sovrascrive l'intero array JSON
await supabase.from('pages').update({ blocks: currentBlocks }).eq('id', pageId);
```

Se User A e User B aprono la stessa pagina contemporaneamente e salvano:

```
t=0  A legge blocks = [hero, text]
t=0  B legge blocks = [hero, text]
t=1  A aggiunge un blocco → salva [hero, text, gallery]
t=2  B modifica il testo → salva [hero, text_modificato]
     ↑ sovrascrive silenziosamente il lavoro di A — gallery scomparso
```

Non c'è nessun errore, nessuna notifica. Il dato è perso.

**Questo è il rischio più alto** perché il pattern esiste oggi e con multi-user diventa frequente.

**Soluzione consigliata — Optimistic locking con `updated_at`**

Sfruttare la colonna `pages.updated_at` già esistente come versione:

```typescript
// Salva solo se la versione in DB è quella che avevi quando hai caricato
const { error } = await supabase
  .from('pages')
  .update({ blocks: newBlocks, updated_at: new Date().toISOString() })
  .eq('id', pageId)
  .eq('updated_at', knownUpdatedAt);  // ← condizione ottimistica

if (error || data.length === 0) {
  // Conflitto: qualcun altro ha salvato nel frattempo
  // → mostrare dialog "Conflitto rilevato" con opzioni:
  //   "Sovrascrivi con le mie modifiche" / "Ricarica e perdi le mie modifiche"
}
```

Lo store deve tenere `pageUpdatedAt: string` e aggiornarlo ad ogni fetch e ad ogni salvataggio riuscito.

**Soluzione alternativa — Soft lock (page lock)**

Aggiungere una tabella `page_locks`:

```sql
CREATE TABLE page_locks (
  page_id    UUID PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  locked_at  TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '5 minutes')
);
```

Quando un editor apre una pagina, acquisisce il lock. Gli altri vedono "User X sta modificando questa pagina" e non possono aprire l'editor (o entrano in read-only). Il lock scade automaticamente dopo 5 minuti di inattività (rinnovato ogni N secondi via heartbeat).

> **Raccomandazione pratica**: implementare **prima l'optimistic locking** (è una modifica chirurgica a `saveBlocks`) come protezione minima. Il soft lock è una UX migliore ma richiede infrastruttura di heartbeat. Le due strategie sono complementari: usare entrambe.

---

### 10.2 ALTO — Concurrent deploy sullo stesso progetto

**Problema**

`deployToCloudflare` in [`app/actions/deploy.ts`](../app/actions/deploy.ts) già oggi ha un problema di deploy concorrenti (documentato in [backend-server-actions.md](./backend-server-actions.md) come limite noto). Con multi-user questo problema diventa molto più probabile: Owner e editor potrebbero cliccare "Pubblica" quasi contemporaneamente.

Conseguenze:
- Due processi Wrangler sullo stesso `--project-name` in parallelo → comportamento non definito su Cloudflare Pages
- Due temp directory con path simili possono interferire se il pattern di nomi collide
- `last_published_at` viene scritto da entrambi → race condition sull'ultimo valore

**Soluzione — Deploy lock in DB**

Aggiungere un campo di lock alla tabella `projects`:

```sql
ALTER TABLE projects ADD COLUMN deploy_locked_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN deploy_locked_by UUID REFERENCES auth.users(id);
```

All'inizio del deploy, acquisire il lock atomicamente con un `UPDATE ... WHERE deploy_locked_at IS NULL`:

```typescript
// Acquisisce lock solo se nessun deploy è in corso
const { data, error } = await supabase
  .from('projects')
  .update({ deploy_locked_at: new Date().toISOString(), deploy_locked_by: user.id })
  .eq('id', projectId)
  .is('deploy_locked_at', null)  // ← atomico: fallisce se già lockato
  .select('id');

if (!data?.length) {
  return { error: 'Deploy già in corso per questo progetto' };
}

try {
  // ... esegui deploy ...
} finally {
  // Rilascia sempre il lock, anche in caso di errore
  await supabase.from('projects')
    .update({ deploy_locked_at: null, deploy_locked_by: null })
    .eq('id', projectId);
}
```

**Gestione lock zombie**: se il deploy crasha senza rilasciare il lock, il progetto rimane bloccato. Aggiungere un controllo: se `deploy_locked_at` è più vecchio di 15 minuti, il lock viene considerato scaduto e sovrascritto.

---

### 10.3 ALTO — TOCTOU sui controlli di piano (check-then-act)

**Problema**

Il pattern di verifica limiti è **check-then-act** in due query separate, non atomico:

```typescript
// lib/permissions.ts — canCreatePage()
const { count } = await supabase.from('pages').select(...).eq('project_id', projectId);
// ← tra qui e il prossimo step, un altro utente può inserire una pagina
if (count >= limits.max_pages_per_project) return { allowed: false };
// ← solo ora viene eseguito l'insert in pages.ts
await supabase.from('pages').insert(...);
```

Con single-user il rischio è basso (difficile essere più veloci di se stessi). Con due editor sullo stesso progetto, entrambi potrebbero passare il check simultaneamente e inserire una pagina in più rispetto al limite.

Esempio: piano starter, limite 7 pagine. Entrambi contano 6, entrambi passano il check, entrambi inseriscono → 8 pagine.

**Soluzione — Constraint DB o funzione atomica**

**Opzione A** — Stored procedure che esegue check + insert in un'unica transazione:

```sql
CREATE OR REPLACE FUNCTION create_page_if_allowed(
  p_project_id UUID, p_user_id UUID, p_slug TEXT, p_title TEXT, p_language TEXT
) RETURNS TABLE(success BOOLEAN, error TEXT, page_id UUID) AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_new_id UUID;
BEGIN
  -- Tutto dentro una transazione con lock
  SELECT COUNT(*) INTO v_count FROM pages WHERE project_id = p_project_id FOR UPDATE;
  SELECT COALESCE(override_max_pages_per_project, pl.max_pages_per_project)
  INTO v_limit FROM profiles pr JOIN plans pl ON pr.plan_id = pl.id
  JOIN projects p ON p.user_id = pr.id WHERE p.id = p_project_id;

  IF v_limit IS NOT NULL AND v_count >= v_limit THEN
    RETURN QUERY SELECT false, 'Limite pagine raggiunto', NULL::UUID;
    RETURN;
  END IF;

  INSERT INTO pages(project_id, slug, title, language) VALUES(p_project_id, p_slug, p_title, p_language)
  RETURNING id INTO v_new_id;

  RETURN QUERY SELECT true, NULL::TEXT, v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Opzione B** — Aggiungere un constraint CHECK a livello DB (meno flessibile ma più semplice):

Difficile da implementare per limiti dinamici per piano. L'Opzione A è preferibile.

> **Priorità**: con traffico basso il TOCTOU è improbabile in pratica. Implementare l'opzione A nella Fase 2, dopo il soft lock sulle pagine.

---

### 10.4 MEDIO — Race condition su `translations_group_id`

**Problema**

In [`app/actions/pages.ts`](../app/actions/pages.ts), `translatePage` ha una logica di **lazy assignment** del `translations_group_id`:

```typescript
// Se la pagina sorgente non ha ancora un gruppo, lo genera e lo salva
if (!sourcePage.translations_group_id) {
  const newGroupId = uuid();
  await supabase.from('pages').update({ translations_group_id: newGroupId }).eq('id', sourcePageId);
  // ← tra il read e questo update, un altro utente potrebbe fare lo stesso
}
```

Se due editor cliccano "Traduci" sulla stessa pagina in rapida successione:
- Entrambi leggono `translations_group_id = null`
- Entrambi generano un UUID diverso
- Entrambi scrivono il loro UUID sulla pagina sorgente (last-write-wins)
- Le due traduzioni create avranno `translations_group_id` diversi → non sono collegate

**Soluzione — Upsert atomico con `COALESCE`**

```sql
-- Un solo update atomico: assegna il gruppo solo se ancora NULL
UPDATE pages
SET translations_group_id = COALESCE(translations_group_id, gen_random_uuid())
WHERE id = $1
RETURNING translations_group_id;
```

Così il primo che arriva assegna l'UUID, il secondo trova già il valore e lo usa. Entrambe le traduzioni finiscono nello stesso gruppo.

---

### 10.5 MEDIO — Stato editor non sincronizzato tra tab/utenti

**Problema**

Lo stato dell'editor vive in [`store/useEditorStore.ts`](../store/useEditorStore.ts) — Zustand, **completamente client-side**. Non c'è nessuna sincronizzazione real-time tra sessioni diverse.

Scenario:
- User A aggiunge un blocco alla pagina e salva
- User B ha la stessa pagina aperta → vede ancora la versione vecchia
- User B aggiunge un altro blocco e salva → sovrascrive il blocco di A (vedi 10.1)

Questo è un problema anche senza multi-user (due tab dello stesso utente), ma con multi-user è la norma.

**Soluzioni in ordine di complessità**

| Approccio | Complessità | Esperienza |
|-----------|-------------|------------|
| **Nessuna sync** (stato attuale) | Bassa | Pessima se ci sono conflitti |
| **Poll periodico** — ogni 30s ricarica `pages.updated_at`; se cambiato avvisa l'utente | Bassa | Accettabile |
| **Supabase Realtime** — sottoscrizione a `pages` per `project_id`; notifica in tempo reale quando un altro utente salva | Media | Buona |
| **CRDT / OT** (es. Yjs) — merge automatico delle modifiche | Alta | Ottima |

> **Raccomandazione**: implementare il **poll periodico** come soluzione rapida (un `setInterval` che controlla `updated_at`), con un banner "Questa pagina è stata modificata da un altro utente — [Ricarica]". In futuro valutare Supabase Realtime per notifiche push.

**Implementazione poll in [`store/useEditorStore.ts`](../store/useEditorStore.ts)**:

```typescript
// Aggiungere allo store
startPresenceWatch: (pageId: string) => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('pages').select('updated_at').eq('id', pageId).single();
    if (data?.updated_at && data.updated_at !== get().pageUpdatedAt) {
      set({ hasRemoteChanges: true });  // → mostra banner in EditorClient
    }
  }, 30_000);
  set({ presenceWatchInterval: interval });
},
```

---

### 10.6 BASSO — Concurrent upload immagini e drift storage counter

**Problema**

Il trigger `track_storage_usage` in [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) aggiorna `profiles.storage_used_bytes` ad ogni INSERT/DELETE su `storage.objects`. Con più upload simultanei dallo stesso progetto (due editor che caricano immagini in parallelo), i trigger eseguono `UPDATE ... SET storage_used_bytes = storage_used_bytes + delta` in parallelo su PostgreSQL.

PostgreSQL gestisce correttamente questo caso con MVCC e lock impliciti sulle righe — **non è una race condition a livello di correttezza**. Tuttavia:

- Se due upload avvengono dentro la stessa transazione PostgreSQL (improbabile in Supabase), potrebbe esserci un deadlock teorico
- Il drift esistente (già documentato in [piani-e-permessi.md](./piani-e-permessi.md) sezione 10) per `metadata->>'size' = NULL` rimane valido e si amplifica con più upload simultanei

**Azione**: nessuna nuova azione richiesta oltre a quelle già documentate in `piani-e-permessi.md`. Il meccanismo di resync SQL manuale già descritto è sufficiente.

---

### 10.7 BASSO — Inviti duplicati sotto carico

**Problema**

Se l'owner clicca due volte rapidamente "Invita" per la stessa email, due record `project_invitations` vengono creati quasi simultaneamente.

**Soluzione**: il constraint `UNIQUE (project_id, email)` proposto nello schema di `project_invitations` già gestisce questo caso a livello DB — il secondo INSERT fallirà con un errore di constraint. La Server Action deve gestire questo errore e restituire "Invito già inviato a questa email".

---

### 10.8 Riepilogo Rischi e Soluzioni

| # | Rischio | Gravità | Soluzione consigliata | File impattati |
|---|---------|---------|----------------------|----------------|
| 10.1 | Last-write-wins su `blocks` | **CRITICO** | Optimistic locking su `updated_at` | [`store/useEditorStore.ts`](../store/useEditorStore.ts), [`app/actions/pages.ts`](../app/actions/pages.ts) |
| 10.2 | Deploy concorrenti | **ALTO** | Lock in `projects` con UPDATE atomico | [`app/actions/deploy.ts`](../app/actions/deploy.ts), migration SQL |
| 10.3 | TOCTOU su limiti piano | **ALTO** | Stored procedure atomica `create_page_if_allowed` | [`supabase/permissions_system.sql`](../supabase/permissions_system.sql), [`lib/permissions.ts`](../lib/permissions.ts) |
| 10.4 | Race su `translations_group_id` | **MEDIO** | `COALESCE` atomico nel UPDATE | [`app/actions/pages.ts`](../app/actions/pages.ts) |
| 10.5 | Stato editor out-of-sync | **MEDIO** | Poll su `updated_at` + banner "ricarica" | [`store/useEditorStore.ts`](../store/useEditorStore.ts), [`app/editor/[projectId]/[pageId]/EditorClient.tsx`](../app/editor/%5BprojectId%5D/%5BpageId%5D/EditorClient.tsx) |
| 10.6 | Drift storage counter multi-upload | **BASSO** | Già documentato, resync SQL sufficiente | — |
| 10.7 | Inviti duplicati | **BASSO** | UNIQUE constraint su `project_invitations` | migration SQL |

---

## 11. Ordine di Implementazione Consigliato

### Fase 1 — Fondamenta DB e permessi (prerequisito di tutto)

1. Migration SQL: crea `project_members`, `project_invitations`
2. Aggiungi `can_collaborate`, `max_collaborators` a `plans` e `profiles`
3. Aggiungi `deploy_locked_at`, `deploy_locked_by` a `projects`
4. Aggiorna RPC `get_user_limits`
5. Crea stored procedure `create_page_if_allowed` per check atomico
6. Aggiorna RLS su `projects`, `pages`, `site_globals`
7. Aggiorna RLS su storage per upload collaboratori
8. Aggiungi `getProjectRole()`, `canEditProject()`, `canDeployProject()` a [`lib/permissions.ts`](../lib/permissions.ts)

### Fase 2 — Protezioni concorrenza (alta priorità)

9. Implementa optimistic locking in [`store/useEditorStore.ts`](../store/useEditorStore.ts): salva e controlla `updated_at`
10. Implementa deploy lock in [`app/actions/deploy.ts`](../app/actions/deploy.ts)
11. Fix `translations_group_id` race in [`app/actions/pages.ts`](../app/actions/pages.ts) con `COALESCE` atomico
12. Aggiungi poll `updated_at` allo store + banner "ricarica" in [`app/editor/[projectId]/[pageId]/EditorClient.tsx`](../app/editor/%5BprojectId%5D/%5BpageId%5D/EditorClient.tsx)

### Fase 3 — Server Actions

13. Aggiorna [`app/actions/pages.ts`](../app/actions/pages.ts): sostituisce ownership check con `getProjectRole()`
14. Aggiorna [`app/actions/deploy.ts`](../app/actions/deploy.ts): sostituisce ownership check
15. Crea le nuove Server Actions in [`app/actions/projects.ts`](../app/actions/projects.ts): `inviteMember`, `removeMember`, `acceptInvitation`, `updateMemberRole`

### Fase 4 — Frontend editor

16. Aggiorna [`app/editor/page.tsx`](../app/editor/page.tsx): carica anche progetti condivisi
17. Aggiorna [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx): sezione "Condivisi con me"
18. Aggiorna [`app/editor/[projectId]/page.tsx`](../app/editor/%5BprojectId%5D/page.tsx): passa `userRole` al Client
19. Aggiorna [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx): UI condizionale per ruolo
20. Aggiorna [`app/editor/[projectId]/[pageId]/EditorClient.tsx`](../app/editor/%5BprojectId%5D/%5BpageId%5D/EditorClient.tsx): modalità read-only + banner conflitto
21. Crea `components/blocks/sidebar/settings/CollaboratorsSection.tsx`
22. Integra in [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx)

### Fase 5 — Flusso invito

23. Crea `app/inviti/[token]/page.tsx`
24. Implementa invio email (via Supabase Auth hook o provider esterno)
25. Aggiorna [`components/editor/cards/ProjectCard.tsx`](../components/editor/cards/ProjectCard.tsx): badge collaborazione

---

## 12. File Impattati — Riepilogo

### Database (nuovi file SQL)

| File | Tipo | Modifica |
|------|------|---------|
| `supabase/migration_multi_user.sql` | NUOVO | Tabelle `project_members`, `project_invitations`; update `plans`, `profiles`; aggiunge `deploy_locked_at`/`deploy_locked_by` a `projects`; RLS aggiornate; stored procedure `create_page_if_allowed` |
| [`supabase/permissions_system.sql`](../supabase/permissions_system.sql) | MODIFICA | Aggiornare `get_user_limits` per i nuovi campi collaborazione |

### Backend

| File | Tipo | Modifica |
|------|------|---------|
| [`lib/permissions.ts`](../lib/permissions.ts) | MODIFICA | Aggiungere `getProjectRole()`, `canEditProject()`, `canDeployProject()`, `canManageArticles()`; aggiornare `UserLimits` |
| [`app/actions/pages.ts`](../app/actions/pages.ts) | MODIFICA | Sostituire ownership check con role check; fix race `translations_group_id` con `COALESCE` atomico |
| [`app/actions/deploy.ts`](../app/actions/deploy.ts) | MODIFICA | Sostituire ownership check con role check; aggiungere deploy lock acquire/release |
| [`app/actions/projects.ts`](../app/actions/projects.ts) | MODIFICA | Aggiungere `inviteMember`, `removeMember`, `updateMemberRole`, `acceptInvitation` |

### Storage

| File | Tipo | Modifica |
|------|------|---------|
| `supabase/migration_multi_user.sql` | NUOVO | Policy RLS storage per upload collaboratori `editor` |
| [`supabase/functions/cleanup-storage/index.ts`](../supabase/functions/cleanup-storage/index.ts) | **NESSUNA** | Path usa già owner's userId, non cambia |

### Frontend — App Router

| File | Tipo | Modifica |
|------|------|---------|
| [`app/editor/page.tsx`](../app/editor/page.tsx) | MODIFICA | Carica anche progetti condivisi |
| [`app/editor/ProjectListClient.tsx`](../app/editor/ProjectListClient.tsx) | MODIFICA | Sezione "Condivisi con me", escludere progetti altrui dai check limite |
| [`app/editor/[projectId]/page.tsx`](../app/editor/%5BprojectId%5D/page.tsx) | MODIFICA | Recupera e passa `userRole` |
| [`app/editor/[projectId]/ProjectDashboardClient.tsx`](../app/editor/%5BprojectId%5D/ProjectDashboardClient.tsx) | MODIFICA | UI condizionale per ruolo |
| [`app/editor/[projectId]/[pageId]/EditorClient.tsx`](../app/editor/%5BprojectId%5D/%5BpageId%5D/EditorClient.tsx) | MODIFICA | Modalità read-only per viewer/articles_manager; banner conflitto rilevato |
| `app/inviti/[token]/page.tsx` | NUOVO | Pagina accettazione invito |

### Frontend — Componenti

| File | Tipo | Modifica |
|------|------|---------|
| `components/blocks/sidebar/settings/CollaboratorsSection.tsx` | NUOVO | UI gestione collaboratori |
| [`components/blocks/ConfigSidebar.tsx`](../components/blocks/ConfigSidebar.tsx) | MODIFICA | Aggiungi `CollaboratorsSection` nella tab Impostazioni |
| [`components/editor/cards/ProjectCard.tsx`](../components/editor/cards/ProjectCard.tsx) | MODIFICA | Badge/indicatore collaborazione |
| [`store/useEditorStore.ts`](../store/useEditorStore.ts) | MODIFICA | Aggiungere `userRole` e `isReadOnly` allo state globale; optimistic locking (`pageUpdatedAt`); poll presenza (`startPresenceWatch`, `hasRemoteChanges`) |

### Tipi

| File | Tipo | Modifica |
|------|------|---------|
| [`types/editor.ts`](../types/editor.ts) | MODIFICA | Aggiungere `ProjectMember`, `ProjectInvitation`, `ProjectRole` |

---

## Note di Sicurezza

1. **Non fidarsi mai del ruolo passato dal client**: `userRole` passato come prop ai Client Components è solo per la UI. L'enforcement reale avviene sempre nelle Server Actions tramite `getProjectRole()`.

2. **Limiti verificati sempre sull'owner**: le Server Actions devono recuperare l'`owner_id` del progetto e usarlo per i check di piano, non l'id del collaboratore.

3. **Token invito come segreto**: il token in `project_invitations` deve essere trattato come password — non loggare, non esporre nell'URL permanente, impostare scadenza ragionevole (7 giorni).

4. **Verifica email all'accettazione**: al momento di `acceptInvitation`, verificare che l'email dell'utente autenticato corrisponda all'email nell'invito. Senza questo check, un utente potrebbe usare un link di invito destinato a qualcun altro.

5. **Cascade delete**: assicurarsi che `project_members` e `project_invitations` abbiano `ON DELETE CASCADE` su `project_id` — già incluso nello schema proposto.
