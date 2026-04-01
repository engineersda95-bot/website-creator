-- Add translation_group to link translated blog posts together
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS translation_group UUID;

-- Drop the old unique constraint (project_id, slug) and replace with (project_id, slug, language)
-- so the same slug can exist in different languages
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_project_id_slug_key;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_project_id_slug_lang_key UNIQUE (project_id, slug, language);

-- Index for fast translation group lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group ON blog_posts(translation_group) WHERE translation_group IS NOT NULL;

-- Backfill: assign a translation_group to each existing post (itself)
UPDATE blog_posts SET translation_group = id WHERE translation_group IS NULL;
