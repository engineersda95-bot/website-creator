-- 1. Aggiungi la colonna 'title' se manca
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pages' AND column_name='title') THEN
        ALTER TABLE pages ADD COLUMN title text NOT NULL DEFAULT 'Pagina Senza Titolo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pages' AND column_name='seo') THEN
        ALTER TABLE pages ADD COLUMN seo jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Assicurati che 'project_id' in 'pages' abbia la foreign key corretta
-- (Opzionale, di solito già presente se hai creato la tabella come suggerito)
-- ALTER TABLE pages ADD CONSTRAINT pages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 3. Aggiungi 'user_id' a 'projects' se manca
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='user_id') THEN
        ALTER TABLE projects ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- 4. Abilita RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 5. Ricrea le Policy (Prima le cancelliamo per evitare errori di duplicato)
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;

CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view pages of their projects" ON pages;
DROP POLICY IF EXISTS "Users can insert pages into their projects" ON pages;
DROP POLICY IF EXISTS "Users can update pages of their projects" ON pages;

CREATE POLICY "Users can view pages of their projects" ON pages FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = pages.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can insert pages into their projects" ON pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = pages.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update pages of their projects" ON pages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = pages.project_id AND projects.user_id = auth.uid())
);
