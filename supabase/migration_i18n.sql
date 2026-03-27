-- Aggiornamento i18n per SitiVetrina (Fase 1)
-- Da eseguire nell'editor SQL di Supabase

-- 1. Aggiungi la colonna 'language' alla tabella 'pages' se manca
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pages' AND column_name='language') THEN
        ALTER TABLE pages ADD COLUMN language text DEFAULT 'it';
    END IF;
END $$;

-- 2. Aggiorna i vincoli di unicità (slug univoco per lingua per progetto)
-- Prima rimuoviamo il vecchio vincolo (se presente)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_project_id_slug_key') THEN
        ALTER TABLE pages DROP CONSTRAINT pages_project_id_slug_key;
    END IF;
END $$;

-- Aggiungi il nuovo vincolo (project_id, slug, language)
ALTER TABLE pages ADD CONSTRAINT pages_project_id_slug_language_key UNIQUE (project_id, slug, language);

-- 3. Inizializzazione dati
-- Vogliamo che tutti i progetti esistenti abbiano 'languages': ['it'] e 'defaultLanguage': 'it' nel JSONB settings (se settings non è null)
UPDATE projects 
SET settings = COALESCE(settings, '{}'::jsonb) || '{"languages": ["it"], "defaultLanguage": "it"}'::jsonb
WHERE (settings->>'languages') IS NULL;

-- Commenti
COMMENT ON COLUMN pages.language IS 'Codice lingua della pagina (es: it, en)';
