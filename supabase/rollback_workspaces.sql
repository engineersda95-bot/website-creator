-- ============================================================
-- ROLLBACK: migration_workspaces.sql
--
-- Restores the pre-workspace single-user model: recreates the
-- plan/limit/AI-credit columns on `profiles`, repopulates them
-- from `workspaces`, restores get_user_limits/increment_ai_usage/
-- track_storage_usage/handle_new_user to their pre-workspace form,
-- drops workspace_id from `projects`, and drops all workspace
-- tables.
--
-- IMPORTANT — data-loss window: if any workspace has MORE THAN
-- ONE active member (i.e. an invite already happened and the
-- workspace is no longer 1:1 with its original owner), this
-- rollback collapses everything back onto the original owner's
-- profile — any AI credits consumed by invited members, and the
-- invited members' workspace_member_roles / *_site_access rows,
-- are irrecoverably lost once this runs. Safe to run only if no
-- invites have happened yet (single-admin workspaces only) — the
-- DO block below aborts automatically if that's not the case.
--
-- Run this AFTER rollback_workspace_storage_policies.sql if
-- rolling back both (that file's policies reference the tables
-- this script drops).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. Safety check: abort if any workspace has more than one
--    active/invited member — rolling back would silently lose
--    those members' roles, scoping and workspace-level AI usage.
-- ------------------------------------------------------------

DO $$
DECLARE
  v_multi_member_workspaces INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_multi_member_workspaces
  FROM (
    SELECT workspace_id
    FROM public.workspace_members
    WHERE status IN ('active', 'invited')
    GROUP BY workspace_id
    HAVING COUNT(*) > 1
  ) sub;

  IF v_multi_member_workspaces > 0 THEN
    RAISE EXCEPTION 'Rollback aborted: % workspace(s) have more than one member. Rolling back would lose their roles/access data. Resolve manually before rolling back.', v_multi_member_workspaces;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 1. Recreate the columns on profiles that were dropped
-- ------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.plans(id) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS override_max_projects INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_pages_per_project INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_storage_mb INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_ai_per_month INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_articles_per_project INTEGER,
  ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_warning_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ai_generations_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_month_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now());

-- ------------------------------------------------------------
-- 2. Repopulate profiles from each user's (sole) workspace
-- ------------------------------------------------------------

UPDATE public.profiles p
SET
  plan_id = w.plan_id,
  override_max_projects = w.override_max_projects,
  override_max_pages_per_project = w.override_max_pages_per_project,
  override_max_storage_mb = w.override_max_storage_mb,
  override_max_ai_per_month = w.override_max_ai_per_month,
  override_max_articles_per_project = w.override_max_articles_per_project,
  storage_used_bytes = w.storage_used_bytes,
  storage_warning_sent_at = w.storage_warning_sent_at,
  ai_generations_this_month = w.ai_generations_this_month,
  ai_month_reset_at = w.ai_month_reset_at
FROM public.workspaces w
WHERE w.owner_user_id = p.id;

-- ------------------------------------------------------------
-- 3. Restore projects.user_id-based ownership (drop workspace_id)
-- ------------------------------------------------------------

DROP INDEX IF EXISTS idx_projects_workspace_id;
ALTER TABLE public.projects DROP COLUMN IF EXISTS workspace_id;

-- ------------------------------------------------------------
-- 4. Restore get_user_limits (pre-workspace form)
-- ------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_workspace_limits(UUID);

CREATE OR REPLACE FUNCTION public.get_user_limits(p_user_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  max_projects INTEGER,
  max_pages_per_project INTEGER,
  max_storage_mb INTEGER,
  max_ai_per_month INTEGER,
  max_articles_per_project INTEGER,
  can_custom_domain BOOLEAN,
  can_custom_scripts BOOLEAN,
  can_multilang BOOLEAN,
  can_remove_branding BOOLEAN,
  storage_used_bytes BIGINT,
  ai_used_this_month INTEGER
) AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_plan public.plans%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  SELECT * INTO v_plan FROM public.plans WHERE id = COALESCE(v_profile.plan_id, 'free');

  IF date_trunc('month', now()) > date_trunc('month', COALESCE(v_profile.ai_month_reset_at, now() - INTERVAL '1 month')) THEN
    UPDATE public.profiles
    SET ai_generations_this_month = 0,
        ai_month_reset_at = date_trunc('month', now())
    WHERE id = p_user_id;
    v_profile.ai_generations_this_month := 0;
  END IF;

  RETURN QUERY SELECT
    COALESCE(v_profile.plan_id, 'free'),
    COALESCE(v_profile.override_max_projects,          v_plan.max_projects),
    COALESCE(v_profile.override_max_pages_per_project, v_plan.max_pages_per_project),
    COALESCE(v_profile.override_max_storage_mb,        v_plan.max_storage_mb),
    COALESCE(v_profile.override_max_ai_per_month,      v_plan.max_ai_per_month),
    COALESCE(v_profile.override_max_articles_per_project, v_plan.max_articles_per_project),
    v_plan.can_custom_domain,
    v_plan.can_custom_scripts,
    v_plan.can_multilang,
    v_plan.can_remove_branding,
    COALESCE(v_profile.storage_used_bytes, 0::BIGINT),
    COALESCE(v_profile.ai_generations_this_month, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 5. Restore increment_ai_usage (pre-workspace form)
-- ------------------------------------------------------------

DROP FUNCTION IF EXISTS public.increment_ai_usage(UUID);

CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    ai_generations_this_month = ai_generations_this_month + 1,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 6. Restore track_storage_usage trigger (pre-workspace form,
--    keyed off profiles via projects.user_id)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.track_storage_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_new_size BIGINT;
  v_old_size BIGINT;
  v_delta BIGINT;
  v_project_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.bucket_id = 'project-assets' THEN
    v_project_id := split_part(NEW.name, '/', 1);
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_new_size > 0 THEN
      UPDATE public.profiles SET storage_used_bytes = storage_used_bytes + v_new_size WHERE id = v_user_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND NEW.bucket_id = 'project-assets' THEN
    v_project_id := split_part(NEW.name, '/', 1);
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);
    v_delta := v_new_size - v_old_size;

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_delta <> 0 THEN
      UPDATE public.profiles SET storage_used_bytes = GREATEST(0, storage_used_bytes + v_delta) WHERE id = v_user_id;
    END IF;

  ELSIF TG_OP = 'DELETE' AND OLD.bucket_id = 'project-assets' THEN
    v_project_id := split_part(OLD.name, '/', 1);
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_old_size > 0 THEN
      UPDATE public.profiles SET storage_used_bytes = GREATEST(0, storage_used_bytes - v_old_size) WHERE id = v_user_id;
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
-- 7. Restore handle_new_user (pre-workspace form)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan_id, ai_month_reset_at)
  VALUES (new.id, 'free', date_trunc('month', now()))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 8. Drop RLS policies (they depend on workspace_members via
--    current_user_workspace_id()/current_user_workspace_role_ids()
--    and block a plain DROP TABLE), then the helper functions,
--    then the workspace tables themselves (children first).
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Members can view their workspace membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Members can view their workspace roles" ON public.workspace_member_roles;
DROP POLICY IF EXISTS "Members can view their workspace editor access" ON public.editor_site_access;
DROP POLICY IF EXISTS "Members can view their workspace blog editor access" ON public.blog_editor_site_access;

DROP FUNCTION IF EXISTS public.current_user_workspace_role_ids();
DROP FUNCTION IF EXISTS public.current_user_workspace_id();

DROP TABLE IF EXISTS public.editor_site_access;
DROP TABLE IF EXISTS public.blog_editor_site_access;
DROP TABLE IF EXISTS public.workspace_member_roles;
DROP TABLE IF EXISTS public.workspace_members;
DROP TABLE IF EXISTS public.workspaces;

-- ------------------------------------------------------------
-- 9. Drop plans.max_users (added by the forward migration)
-- ------------------------------------------------------------

ALTER TABLE public.plans DROP COLUMN IF EXISTS max_users;

COMMIT;

-- ------------------------------------------------------------
-- Post-rollback verification (run manually):
--
--   SELECT COUNT(*) FROM public.profiles WHERE plan_id IS NULL;  -- should be 0
--   SELECT COUNT(*) FROM public.projects WHERE user_id IS NULL;  -- should be 0
--   SELECT to_regclass('public.workspaces');                     -- should be NULL (table gone)
-- ------------------------------------------------------------
