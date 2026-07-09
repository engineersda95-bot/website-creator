-- ============================================================
-- ROLLBACK: migration_workspace_storage_policies.sql
-- Restores the storage.objects policies to their pre-workspace,
-- owner-only state (via projects.user_id) — but checking the
-- SECOND path segment (the real project id, since the upload
-- path is '{userId}/{projectId}/{filename}'), not the first.
-- The original fix_storage_security.sql checked the first segment,
-- which never matches this path shape and blocks every upload —
-- this was discovered and fixed directly against the live DB
-- before this rollback file was updated to match.
--
-- Run this BEFORE rollback_workspaces.sql if rolling back both,
-- since these policies reference workspace_members / editor_site_access
-- / blog_editor_site_access, which rollback_workspaces.sql drops.
-- ============================================================

DROP POLICY IF EXISTS "User can upload project assets" ON storage.objects;
CREATE POLICY "User can upload project assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "User can update project assets" ON storage.objects;
CREATE POLICY "User can update project assets" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

DROP POLICY IF EXISTS "User can delete project assets" ON storage.objects;
CREATE POLICY "User can delete project assets" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM public.projects WHERE user_id = auth.uid()
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);
