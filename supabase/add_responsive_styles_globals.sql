-- Add responsive_styles column to site_globals to support mobile/tablet overrides on nav/footer
ALTER TABLE site_globals
  ADD COLUMN IF NOT EXISTS responsive_styles JSONB NOT NULL DEFAULT '{}';
