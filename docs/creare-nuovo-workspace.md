# Creare un nuovo workspace e assegnare un admin

Oggi il prodotto **non ha un flusso applicativo** per creare un workspace da zero (nessuna route worker, nessun pulsante in UI). Va fatto manualmente via SQL su Supabase.

## Procedura (via SQL)

1. Crea l'utente in **Supabase Dashboard → Authentication → Users → Add user** (email + password), oppure usa un utente già esistente in `auth.users` che non ha ancora un workspace.

   ⚠️ Non usare "Invite" — l'invito valorizza `invited_at` su quell'utente, il che non impedisce lo script sotto ma è irrilevante per questo metodo (lo script crea il workspace a prescindere da `invited_at`, a differenza del trigger di self-signup).

2. Copia lo `id` (UUID) dell'utente da Authentication → Users.

3. **Verifica che non abbia già un workspace** (evita duplicati — vedi nota in fondo):

   ```sql
   SELECT w.id, w.name, w.owner_user_id
   FROM public.workspaces w
   JOIN public.workspace_members m ON m.workspace_id = w.id
   WHERE m.user_id = '<USER_ID>';
   ```

   Se questa query ritorna una riga, l'utente ha già un workspace — fermati e valuta se è davvero quello che vuoi prima di procedere.

4. Esegui su **Supabase SQL Editor**, sostituendo `<USER_ID>` e `<NOME_WORKSPACE>`:

   ```sql
   DO $$
   DECLARE
     v_user_id UUID := '<USER_ID>';
     v_workspace_id UUID;
     v_member_id UUID;
   BEGIN
     -- 1. Crea il workspace
     INSERT INTO public.workspaces (owner_user_id, name, plan_id)
     VALUES (v_user_id, '<NOME_WORKSPACE>', 'free')
     RETURNING id INTO v_workspace_id;

     -- 2. Aggiunge l'utente come membro attivo
     INSERT INTO public.workspace_members (workspace_id, user_id, status, joined_at)
     VALUES (v_workspace_id, v_user_id, 'active', now())
     RETURNING id INTO v_member_id;

     -- 3. Gli assegna il ruolo admin
     INSERT INTO public.workspace_member_roles (workspace_member_id, role)
     VALUES (v_member_id, 'admin');

     RAISE NOTICE 'Workspace % creato per utente %', v_workspace_id, v_user_id;
   END $$;
   ```

5. **Verifica post-creazione**:

   ```sql
   SELECT
     w.id AS workspace_id,
     w.name AS workspace_name,
     w.plan_id,
     m.id AS member_id,
     m.status,
     r.role
   FROM public.workspaces w
   JOIN public.workspace_members m ON m.workspace_id = w.id
   JOIN public.workspace_member_roles r ON r.workspace_member_id = m.id
   WHERE m.user_id = '<USER_ID>';
   ```

   Deve restituire una riga con `status = 'active'` e `role = 'admin'`.

A questo punto l'utente, facendo login, è admin del nuovo workspace: vede "Gestione utenti" nel menu e può invitare altri membri (che ricevono `createUser` + password temporanea da copiare — vedi `worker/src/routes/workspace-users.ts`).

## Perché un solo workspace per utente

Il prodotto assume oggi che ogni utente appartenga a **un solo workspace**. `getWorkspaceContext` in `worker/src/lib/authz.ts` prende sempre e solo il primo risultato trovato (`.limit(1).maybeSingle()`). Se un utente finisce con due workspace (es. eseguendo lo script su un utente che ne aveva già uno), non ci sono errori, ma il worker userà uno dei due in modo non prevedibile — per questo il passo 3 è importante, non opzionale.

## Nota: creazione automatica via self-signup

Esiste anche un percorso automatico, ma è pensato per il flusso di registrazione libera, non per creare workspace su richiesta: quando un utente si crea da sé con `invited_at IS NULL` (self-signup diretto, non tramite invito admin), il trigger `handle_new_user()` (`supabase/migration_workspaces.sql`, sezione 9) crea automaticamente workspace + membership + ruolo admin per lui, con nome fisso `"Workspace personale"`. Se in futuro serve un flusso applicativo vero (pulsante "Nuovo workspace" in UI), andrebbe costruita una route dedicata (es. `POST /workspaces`) invece di continuare con SQL manuale.
