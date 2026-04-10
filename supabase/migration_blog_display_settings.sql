-- Migration: Add display_settings column to blog_posts
-- Run AFTER migration_blog.sql
-- Adds JSONB column for per-article display configuration (TOC, cover mode, body padding, etc.)

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS display_settings JSONB DEFAULT '{}'::jsonb;
