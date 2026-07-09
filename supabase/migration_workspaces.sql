-- ============================================================
-- MULTI-USER WORKSPACES
-- Run this migration on Supabase SQL editor.
-- Requires permissions_system.sql to have been applied already
-- (plans, profiles.plan_id/override_*/storage_*/ai_* columns).
-- No active production customers — this migration drops the
-- columns it moves off `profiles` instead of leaving them dead.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. New tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
  override_max_projects INTEGER,
  override_max_pages_per_project INTEGER,
  override_max_storage_mb INTEGER,
  override_max_ai_per_month INTEGER,
  override_max_articles_per_project INTEGER,
  override_max_users INTEGER,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_warning_sent_at TIMESTAMP WITH TIME ZONE,
  ai_generations_this_month INTEGER NOT NULL DEFAULT 0,
  ai_month_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'removed')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.workspace_member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id UUID NOT NULL REFERENCES public.workspace_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'blog_editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (workspace_member_id, role)
);

CREATE TABLE IF NOT EXISTS public.editor_site_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_role_id UUID NOT NULL REFERENCES public.workspace_member_roles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (workspace_member_role_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.blog_editor_site_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_role_id UUID NOT NULL REFERENCES public.workspace_member_roles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (workspace_member_role_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_member_roles_member_id ON public.workspace_member_roles(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_editor_site_access_role_id ON public.editor_site_access(workspace_member_role_id);
CREATE INDEX IF NOT EXISTS idx_blog_editor_site_access_role_id ON public.blog_editor_site_access(workspace_member_role_id);

-- ------------------------------------------------------------
-- 2. plans.max_users
-- ------------------------------------------------------------

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_users INTEGER;

UPDATE public.plans SET max_users = 1   WHERE id = 'free'    AND max_users IS NULL;
UPDATE public.plans SET max_users = 3   WHERE id = 'starter' AND max_users IS NULL;
UPDATE public.plans SET max_users = 10  WHERE id = 'pro'     AND max_users IS NULL;
UPDATE public.plans SET max_users = NULL WHERE id = 'agency';

-- ------------------------------------------------------------
-- 3. projects.workspace_id (nullable for now, backfilled below)
-- ------------------------------------------------------------

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id);

-- ------------------------------------------------------------
-- 4. Backfill: one workspace per existing profile
-- ------------------------------------------------------------

INSERT INTO public.workspaces (
  owner_user_id, name, plan_id,
  override_max_projects, override_max_pages_per_project, override_max_storage_mb,
  override_max_ai_per_month, override_max_articles_per_project,
  storage_used_bytes, storage_warning_sent_at,
  ai_generations_this_month, ai_month_reset_at
)
SELECT
  p.id,
  'Workspace personale',
  COALESCE(p.plan_id, 'free'),
  p.override_max_projects, p.override_max_pages_per_project, p.override_max_storage_mb,
  p.override_max_ai_per_month, p.override_max_articles_per_project,
  COALESCE(p.storage_used_bytes, 0), p.storage_warning_sent_at,
  COALESCE(p.ai_generations_this_month, 0), COALESCE(p.ai_month_reset_at, date_trunc('month', now()))
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.workspaces w WHERE w.owner_user_id = p.id);

-- One active membership per new workspace, owner = admin
INSERT INTO public.workspace_members (workspace_id, user_id, status, joined_at)
SELECT w.id, w.owner_user_id, 'active', now()
FROM public.workspaces w
WHERE NOT EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = w.id AND m.user_id = w.owner_user_id);

INSERT INTO public.workspace_member_roles (workspace_member_id, role)
SELECT m.id, 'admin'
FROM public.workspace_members m
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_member_roles r WHERE r.workspace_member_id = m.id AND r.role = 'admin'
);

-- Link existing projects to their owner's workspace
UPDATE public.projects p
SET workspace_id = w.id
FROM public.workspaces w
WHERE w.owner_user_id = p.user_id AND p.workspace_id IS NULL;

-- ------------------------------------------------------------
-- 5. Integrity check before enforcing NOT NULL
-- ------------------------------------------------------------

DO $$
DECLARE
  v_orphans INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_orphans FROM public.projects WHERE workspace_id IS NULL;
  IF v_orphans > 0 THEN
    RAISE EXCEPTION 'Migration aborted: % projects have no workspace_id after backfill', v_orphans;
  END IF;
END $$;

ALTER TABLE public.projects ALTER COLUMN workspace_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);

-- ------------------------------------------------------------
-- 6. get_workspace_limits — replaces get_user_limits
-- ------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_user_limits(UUID);

CREATE OR REPLACE FUNCTION public.get_workspace_limits(p_workspace_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  max_projects INTEGER,
  max_pages_per_project INTEGER,
  max_storage_mb INTEGER,
  max_ai_per_month INTEGER,
  max_articles_per_project INTEGER,
  max_users INTEGER,
  can_custom_domain BOOLEAN,
  can_custom_scripts BOOLEAN,
  can_multilang BOOLEAN,
  can_remove_branding BOOLEAN,
  storage_used_bytes BIGINT,
  ai_used_this_month INTEGER
) AS $$
DECLARE
  v_workspace public.workspaces%ROWTYPE;
  v_plan public.plans%ROWTYPE;
BEGIN
  SELECT * INTO v_workspace FROM public.workspaces WHERE id = p_workspace_id;
  SELECT * INTO v_plan FROM public.plans WHERE id = COALESCE(v_workspace.plan_id, 'free');

  IF date_trunc('month', now()) > date_trunc('month', COALESCE(v_workspace.ai_month_reset_at, now() - INTERVAL '1 month')) THEN
    UPDATE public.workspaces
    SET ai_generations_this_month = 0,
        ai_month_reset_at = date_trunc('month', now())
    WHERE id = p_workspace_id;
    v_workspace.ai_generations_this_month := 0;
  END IF;

  RETURN QUERY SELECT
    COALESCE(v_workspace.plan_id, 'free'),
    COALESCE(v_workspace.override_max_projects,             v_plan.max_projects),
    COALESCE(v_workspace.override_max_pages_per_project,    v_plan.max_pages_per_project),
    COALESCE(v_workspace.override_max_storage_mb,           v_plan.max_storage_mb),
    COALESCE(v_workspace.override_max_ai_per_month,         v_plan.max_ai_per_month),
    COALESCE(v_workspace.override_max_articles_per_project, v_plan.max_articles_per_project),
    COALESCE(v_workspace.override_max_users,                v_plan.max_users),
    v_plan.can_custom_domain,
    v_plan.can_custom_scripts,
    v_plan.can_multilang,
    v_plan.can_remove_branding,
    COALESCE(v_workspace.storage_used_bytes, 0::BIGINT),
    COALESCE(v_workspace.ai_generations_this_month, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 7. increment_ai_usage — now keyed by workspace
-- ------------------------------------------------------------

DROP FUNCTION IF EXISTS public.increment_ai_usage(UUID);

CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_workspace_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.workspaces
  SET
    ai_generations_this_month = ai_generations_this_month + 1,
    updated_at = now()
  WHERE id = p_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 8. track_storage_usage trigger — now resolves workspace_id
--    via projects.workspace_id instead of profiles via user_id.
--    NOTE: the previous version keyed off (storage.foldername(name))[1]
--    assuming it was the projectId, but the real upload path used
--    throughout the app is '{userId}/{projectId}/{filename}' — so the
--    first segment was actually a userId, not a projectId, and the
--    lookup against projects.id likely never matched. Fixed here to
--    read the second path segment as the projectId.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.track_storage_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
  v_new_size BIGINT;
  v_old_size BIGINT;
  v_delta BIGINT;
  v_project_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.bucket_id = 'project-assets' THEN
    v_project_id := (storage.foldername(NEW.name))[2];
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);

    SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id::text = v_project_id;
    IF v_workspace_id IS NOT NULL AND v_new_size > 0 THEN
      UPDATE public.workspaces SET storage_used_bytes = storage_used_bytes + v_new_size WHERE id = v_workspace_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND NEW.bucket_id = 'project-assets' THEN
    v_project_id := (storage.foldername(NEW.name))[2];
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);
    v_delta := v_new_size - v_old_size;

    SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id::text = v_project_id;
    IF v_workspace_id IS NOT NULL AND v_delta <> 0 THEN
      UPDATE public.workspaces SET storage_used_bytes = GREATEST(0, storage_used_bytes + v_delta) WHERE id = v_workspace_id;
    END IF;

  ELSIF TG_OP = 'DELETE' AND OLD.bucket_id = 'project-assets' THEN
    v_project_id := (storage.foldername(OLD.name))[2];
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);

    SELECT workspace_id INTO v_workspace_id FROM public.projects WHERE id::text = v_project_id;
    IF v_workspace_id IS NOT NULL AND v_old_size > 0 THEN
      UPDATE public.workspaces SET storage_used_bytes = GREATEST(0, storage_used_bytes - v_old_size) WHERE id = v_workspace_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_storage_object_change ON storage.objects;
CREATE TRIGGER on_storage_object_change
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.track_storage_usage();

-- ------------------------------------------------------------
-- 9. handle_new_user — no longer writes plan/AI fields to
--    profiles (they moved to workspaces). Only creates a new
--    workspace for genuine self-signups: if the new auth user
--    already has a pending workspace_members row (i.e. they were
--    created via an admin invite), skip workspace creation.
-- ------------------------------------------------------------

-- Was: checked whether a workspace_members row already existed for
-- new.id to decide "was this user invited by an admin". That check
-- is always false at this point for invites, because the worker
-- calls inviteUserByEmail() (which fires this trigger immediately,
-- on auth.users insert) BEFORE it inserts the workspace_members row
-- for that invite — so every invited user also got a spurious
-- personal workspace created here, in addition to the real one
-- added moments later by the worker. Fixed by checking
-- new.invited_at instead: Supabase populates this column only for
-- users created via the admin "invite by email" API, never for a
-- direct self-signup — so it reliably distinguishes the two cases
-- at the moment this trigger fires, with no dependency on ordering.
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 10. Drop migrated columns from profiles — no active customers,
--     nothing dead is left behind.
-- ------------------------------------------------------------

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS plan_id,
  DROP COLUMN IF EXISTS override_max_projects,
  DROP COLUMN IF EXISTS override_max_pages_per_project,
  DROP COLUMN IF EXISTS override_max_storage_mb,
  DROP COLUMN IF EXISTS override_max_ai_per_month,
  DROP COLUMN IF EXISTS override_max_articles_per_project,
  DROP COLUMN IF EXISTS storage_used_bytes,
  DROP COLUMN IF EXISTS storage_warning_sent_at,
  DROP COLUMN IF EXISTS ai_generations_this_month,
  DROP COLUMN IF EXISTS ai_month_reset_at;

-- ------------------------------------------------------------
-- 11. RLS on the new tables — defense in depth in case a
--     direct frontend-to-Supabase path is ever added for these
--     tables (the worker itself always uses the service-role key
--     and bypasses RLS regardless; its authz.ts/workspaceMiddleware
--     is the primary boundary, checked on every request).
--
--     IMPORTANT: every policy below resolves its check through one
--     of the two SECURITY DEFINER helper functions — never via a
--     direct subquery/join on workspace_members or
--     workspace_member_roles from within a USING clause. A direct
--     subquery on those tables would itself be subject to their RLS
--     policy, forcing Postgres to re-evaluate that policy per
--     candidate row (recursive RLS evaluation) — this caused
--     multi-second latency on every request in earlier iterations
--     of this migration. SECURITY DEFINER makes a function's
--     internal query run with the privileges of the function owner
--     instead of the calling role, bypassing RLS entirely for that
--     lookup — so calling it from a policy cannot recurse back into
--     RLS. STABLE lets Postgres evaluate the function once per
--     statement instead of once per row.
-- ------------------------------------------------------------

-- current_user_workspace_id(): resolves auth.uid() -> workspace_id.
-- SECURITY DEFINER makes its internal SELECT run as the function
-- owner, bypassing RLS entirely for that one lookup — so no policy
-- that calls this function ever triggers RLS re-evaluation on
-- workspace_members. STABLE lets Postgres evaluate it once per
-- statement instead of once per row.
CREATE OR REPLACE FUNCTION public.current_user_workspace_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active' LIMIT 1;
$$;

-- current_user_workspace_role_ids(): resolves auth.uid() ->
-- workspace_member_roles.id[] for their workspace. Same
-- SECURITY DEFINER/STABLE reasoning as above. Policies on
-- editor_site_access/blog_editor_site_access must use THIS
-- function rather than joining workspace_member_roles/
-- workspace_members directly in their USING clause — a direct
-- join would still be subject to RLS on those tables, re-triggering
-- policy evaluation per row (the exact bug this migration fixes).
CREATE OR REPLACE FUNCTION public.current_user_workspace_role_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id
  FROM public.workspace_member_roles r
  JOIN public.workspace_members m ON m.id = r.workspace_member_id
  WHERE m.workspace_id = public.current_user_workspace_id();
$$;

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_site_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_editor_site_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own workspace" ON public.workspaces;
CREATE POLICY "Members can view their own workspace" ON public.workspaces
  FOR SELECT USING (id = public.current_user_workspace_id());

DROP POLICY IF EXISTS "Members can view their workspace membership" ON public.workspace_members;
CREATE POLICY "Members can view their workspace membership" ON public.workspace_members
  FOR SELECT USING (workspace_id = public.current_user_workspace_id());

DROP POLICY IF EXISTS "Members can view their workspace roles" ON public.workspace_member_roles;
CREATE POLICY "Members can view their workspace roles" ON public.workspace_member_roles
  FOR SELECT USING (id IN (SELECT public.current_user_workspace_role_ids()));

DROP POLICY IF EXISTS "Members can view their workspace editor access" ON public.editor_site_access;
CREATE POLICY "Members can view their workspace editor access" ON public.editor_site_access
  FOR SELECT USING (workspace_member_role_id IN (SELECT public.current_user_workspace_role_ids()));

DROP POLICY IF EXISTS "Members can view their workspace blog editor access" ON public.blog_editor_site_access;
CREATE POLICY "Members can view their workspace blog editor access" ON public.blog_editor_site_access
  FOR SELECT USING (workspace_member_role_id IN (SELECT public.current_user_workspace_role_ids()));

COMMIT;

-- ------------------------------------------------------------
-- Post-migration verification (run manually, not part of the
-- transaction):
--
--   SELECT COUNT(*) FROM public.workspaces;              -- should equal pre-migration COUNT(*) FROM profiles
--   SELECT COUNT(*) FROM public.projects WHERE workspace_id IS NULL;  -- must be 0
--   SELECT COUNT(*) FROM public.workspace_members WHERE status = 'active';
--   SELECT COUNT(*) FROM public.workspace_member_roles WHERE role = 'admin';
-- ------------------------------------------------------------
