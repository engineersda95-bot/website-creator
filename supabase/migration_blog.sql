-- migration_blog.sql
-- Aggiunge la tabella blog_posts con RLS, indici e pulizia storage.
-- Eseguire DOPO permissions_system.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Tabella blog_posts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL,
  title             TEXT NOT NULL DEFAULT '',
  excerpt           TEXT,
  cover_image       TEXT,
  categories        JSONB DEFAULT '[]',    -- TEXT[]
  authors           JSONB DEFAULT '[]',    -- { name, slug, bio?, avatar? }[]
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at      TIMESTAMPTZ,
  blocks            JSONB DEFAULT '[]',    -- Block[] (tipo 'text' con content.text in Markdown)
  seo               JSONB DEFAULT '{}',    -- { title?, description?, image?, indexable? }
  language          TEXT DEFAULT 'it',
  translation_group UUID,                  -- collega articoli che sono traduzioni dello stesso contenuto
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Slug unico per lingua per progetto (stesso slug ammesso in lingue diverse)
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_project_slug_lang_unique
  UNIQUE (project_id, slug, language);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Indici
-- ─────────────────────────────────────────────────────────────────────────────

-- Filtrare articoli per progetto + lingua (usato dal blog listing nel deploy)
CREATE INDEX IF NOT EXISTS blog_posts_project_lang_idx
  ON blog_posts (project_id, language);

-- Trovare tutte le traduzioni di un articolo
CREATE INDEX IF NOT EXISTS blog_posts_translation_group_idx
  ON blog_posts (translation_group)
  WHERE translation_group IS NOT NULL;

-- Ordinamento per data di pubblicazione (listing blog)
CREATE INDEX IF NOT EXISTS blog_posts_project_published_idx
  ON blog_posts (project_id, published_at DESC NULLS LAST)
  WHERE status = 'published';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Utenti vedono/modificano solo gli articoli dei propri progetti
CREATE POLICY blog_posts_owner_all ON blog_posts
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Aggiornamento automatico updated_at
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();
