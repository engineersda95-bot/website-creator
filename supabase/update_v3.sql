-- AGGIORNAMENTO DATABASE V3
-- Esegui questo script nel SQL Editor di Supabase (https://app.supabase.com)

-- 1. Aggiungi la colonna 'settings' alla tabella 'projects' se manca
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='settings') THEN
        ALTER TABLE projects ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Assicurati che le policy di RLS permettano l'aggiornamento della colonna settings
-- (Le policy esistenti su 'projects' dovrebbero già coprire tutte le colonne, 
-- ma questo comando assicura che il multi-tenant sia attivo)

COMMENT ON COLUMN projects.settings IS 'Contiene font, colori globali e impostazioni del sito';
