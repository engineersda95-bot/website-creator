-- !! ONE-SHOT DATA MIGRATION — run ONCE in production after migration_multilang.sql !!
-- Backs up nav/footer from pages.blocks into site_globals, then strips them from pages.blocks.
-- MAKE A FULL DATABASE BACKUP BEFORE RUNNING THIS.

BEGIN;

-- ─── 1. Populate site_globals from first page per (project_id, language, type) ──

INSERT INTO site_globals (project_id, language, type, content, style)
SELECT DISTINCT ON (p.project_id, COALESCE(p.language, 'it'), b.type)
  p.project_id,
  COALESCE(p.language, 'it') AS language,
  b.type,
  b.content,
  b.style
FROM pages p
CROSS JOIN LATERAL (
  SELECT
    elem->>'type'    AS type,
    elem->'content'  AS content,
    elem->'style'    AS style
  FROM jsonb_array_elements(p.blocks) AS elem
  WHERE elem->>'type' IN ('navigation', 'footer')
) b
ORDER BY p.project_id, COALESCE(p.language, 'it'), b.type, p.created_at ASC
ON CONFLICT (project_id, language, type) DO NOTHING;

-- ─── 2. Strip nav/footer from all pages.blocks ────────────────────────────────

UPDATE pages
SET blocks = (
  SELECT COALESCE(jsonb_agg(elem ORDER BY ord), '[]'::jsonb)
  FROM jsonb_array_elements(blocks) WITH ORDINALITY AS t(elem, ord)
  WHERE elem->>'type' NOT IN ('navigation', 'footer')
)
WHERE blocks @> '[{"type":"navigation"}]'::jsonb
   OR blocks @> '[{"type":"footer"}]'::jsonb;

COMMIT;
