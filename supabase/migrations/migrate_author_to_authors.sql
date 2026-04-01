-- Migration: author (TEXT) → authors (JSONB array)
-- Run this on existing databases that already have the blog_posts table

-- 1. Add the new column if it doesn't exist
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS authors JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing data from author → authors
UPDATE blog_posts
SET authors = jsonb_build_array(author)
WHERE author IS NOT NULL
  AND author != ''
  AND (authors IS NULL OR authors = '[]'::jsonb);

-- 3. Drop old column
ALTER TABLE blog_posts DROP COLUMN IF EXISTS author;
