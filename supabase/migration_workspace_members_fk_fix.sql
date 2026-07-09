-- ============================================================
-- FIX: workspace_members.invited_by blocks user deletion
--
-- supabase.auth.admin.deleteUser() failed with "Database error
-- deleting user" because workspace_members.invited_by REFERENCES
-- auth.users(id) without ON DELETE CASCADE/SET NULL — Postgres
-- refuses to delete a user who is still referenced as the inviter
-- of another member. invited_by is informational only (audit trail
-- of who sent the invite), so it should not block deletion: set it
-- to NULL instead of preventing the delete.
--
-- Run this once, any time after migration_workspaces.sql.
-- ============================================================

ALTER TABLE public.workspace_members
  DROP CONSTRAINT IF EXISTS workspace_members_invited_by_fkey;

ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_invited_by_fkey
  FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;
