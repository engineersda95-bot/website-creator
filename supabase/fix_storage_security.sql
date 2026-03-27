-- 1. Create the project-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow Anyone to SELECT (Read) assets (Siti Vetrina are public)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-assets');


-- 3. Policy: Allow Authenticated Users to INSERT (Upload) files into their own project folder
-- The path format is '{projectId}/{filename}'
DROP POLICY IF EXISTS "User can upload project assets" ON storage.objects;
CREATE POLICY "User can upload project assets" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND 
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

-- 4. Policy: Allow Authenticated Users to UPDATE (Overwrite) files in their project folder
DROP POLICY IF EXISTS "User can update project assets" ON storage.objects;
CREATE POLICY "User can update project assets" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND 
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

-- 5. Policy: Allow Authenticated Users to DELETE files in their project folder
DROP POLICY IF EXISTS "User can delete project assets" ON storage.objects;
CREATE POLICY "User can delete project assets" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND 
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);
