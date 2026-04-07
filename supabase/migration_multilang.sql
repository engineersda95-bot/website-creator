-- Migration: Multi-language refactoring
-- Step 1: Centralize nav/footer in site_globals
-- Step 2: Add translations_group_id to pages
-- Run this BEFORE running migration_data_one_shot.sql

-- ─── site_globals table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_globals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  language    TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('navigation', 'footer')),
  content     JSONB NOT NULL DEFAULT '{}',
  style       JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, language, type)
);

CREATE INDEX IF NOT EXISTS site_globals_project_id_idx ON site_globals(project_id);
CREATE INDEX IF NOT EXISTS site_globals_project_lang_idx ON site_globals(project_id, language);

-- RLS: a user can only access globals for their own projects
ALTER TABLE site_globals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_globals_owner_select" ON site_globals
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "site_globals_owner_insert" ON site_globals
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "site_globals_owner_update" ON site_globals
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "site_globals_owner_delete" ON site_globals
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- ─── translations_group_id on pages ──────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'translations_group_id'
  ) THEN
    ALTER TABLE pages ADD COLUMN translations_group_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS pages_translations_group_id_idx ON pages(translations_group_id);
