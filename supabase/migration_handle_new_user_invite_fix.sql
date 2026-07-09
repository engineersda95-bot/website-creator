-- ============================================================
-- FIX: handle_new_user() created a spurious personal workspace
-- for invited users, in addition to the real workspace_members
-- row the worker adds right after inviteUserByEmail().
--
-- Root cause: the previous version checked whether a
-- workspace_members row already existed for new.id to detect
-- "was this user invited by an admin". That check is always false
-- at the moment this trigger fires, because inviteUserByEmail()
-- creates the auth.users row (firing this trigger immediately)
-- BEFORE the worker inserts the real workspace_members row for
-- that invite (worker/src/routes/workspace-users.ts, POST /invite).
--
-- Fix: check new.invited_at instead. Supabase populates this
-- column only for users created via the admin "invite by email"
-- API, never for a direct self-signup — so it reliably
-- distinguishes the two cases at the moment this trigger fires,
-- with no dependency on operation ordering.
--
-- Run this once, any time after migration_workspaces.sql.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  IF new.invited_at IS NULL THEN
    INSERT INTO public.workspaces (owner_user_id, name, plan_id)
    VALUES (new.id, 'Workspace personale', 'free')
    RETURNING id INTO v_workspace_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, status, joined_at)
    VALUES (v_workspace_id, new.id, 'active', now());

    INSERT INTO public.workspace_member_roles (workspace_member_id, role)
    SELECT id, 'admin' FROM public.workspace_members WHERE workspace_id = v_workspace_id AND user_id = new.id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
