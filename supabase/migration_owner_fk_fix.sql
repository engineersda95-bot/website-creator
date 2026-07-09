-- ============================================================
-- FIX: projects.user_id and workspaces.owner_user_id block user
-- deletion (both are NO ACTION FKs to auth.users, confirmed via
-- pg_constraint — information_schema didn't surface them because
-- it doesn't expose cross-schema FKs into auth reliably here).
--
-- Neither column is part of the authorization boundary anymore:
-- projects.user_id is a legacy "who originally created this" field
-- (only still used for the storage upload path), and
-- workspaces.owner_user_id is informational (the real admin set is
-- workspace_member_roles). Deleting the referenced user should not
-- be blocked by either — set them to NULL instead.
--
-- Run this once, any time after migration_workspaces.sql.
-- ============================================================

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.workspaces
  ALTER COLUMN owner_user_id DROP NOT NULL;

ALTER TABLE public.workspaces
  DROP CONSTRAINT IF EXISTS workspaces_owner_user_id_fkey;

ALTER TABLE public.workspaces
  ADD CONSTRAINT workspaces_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
