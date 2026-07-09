-- ============================================================
-- FIX: switch from inviteUserByEmail() (blocked by Supabase's
-- email rate limit in testing) to createUser() with a random
-- temporary password, shown once to the admin instead of emailed.
--
-- createUser() never sets auth.users.invited_at (that column is
-- only populated by inviteUserByEmail()), so the handle_new_user()
-- check from migration_handle_new_user_invite_fix.sql (new.invited_at
-- IS NULL) can no longer tell "admin-created member" apart from a
-- genuine self-signup — it would go back to creating a spurious
-- personal workspace for every admin-created user.
--
-- Fix: the worker now passes app_metadata: { invited_by_admin: true }
-- when calling createUser() (see worker/src/routes/workspace-users.ts).
-- The trigger checks that flag instead of invited_at.
--
-- Run this once, any time after migration_handle_new_user_invite_fix.sql.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  IF NOT COALESCE((new.raw_app_meta_data->>'invited_by_admin')::boolean, false) THEN
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
