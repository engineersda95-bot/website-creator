-- ============================================================
-- WORKSPACE STORAGE POLICIES
-- Run this AFTER migration_workspaces.sql (depends on
-- workspace_members, workspace_member_roles, editor_site_access,
-- blog_editor_site_access).
--
-- Supersedes the upload/update/delete storage.objects policies
-- originally created by fix_storage_security.sql. Those policies
-- only granted access to a project's owner (projects.user_id);
-- this migration extends them so that any active workspace member
-- with access to a project (admin, or editor/blog_editor scoped
-- to it) can also upload/update/delete its assets — needed because
-- the upload path '{userId}/{projectId}/{filename}' identifies the
-- uploader, not the project owner, and workspace members other
-- than the owner now legitimately upload into a project's folder.
-- ============================================================

DROP POLICY IF EXISTS "User can upload project assets" ON storage.objects;
CREATE POLICY "User can upload project assets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  (
    (storage.foldername(name))[2] IN (
      SELECT p.id::text
      FROM public.projects p
      JOIN public.workspace_members m ON m.workspace_id = p.workspace_id AND m.user_id = auth.uid() AND m.status = 'active'
      LEFT JOIN public.workspace_member_roles r ON r.workspace_member_id = m.id
      WHERE r.role = 'admin'
         OR EXISTS (SELECT 1 FROM public.editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
         OR EXISTS (SELECT 1 FROM public.blog_editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
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
      SELECT p.id::text
      FROM public.projects p
      JOIN public.workspace_members m ON m.workspace_id = p.workspace_id AND m.user_id = auth.uid() AND m.status = 'active'
      LEFT JOIN public.workspace_member_roles r ON r.workspace_member_id = m.id
      WHERE r.role = 'admin'
         OR EXISTS (SELECT 1 FROM public.editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
         OR EXISTS (SELECT 1 FROM public.blog_editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
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
      SELECT p.id::text
      FROM public.projects p
      JOIN public.workspace_members m ON m.workspace_id = p.workspace_id AND m.user_id = auth.uid() AND m.status = 'active'
      LEFT JOIN public.workspace_member_roles r ON r.workspace_member_id = m.id
      WHERE r.role = 'admin'
         OR EXISTS (SELECT 1 FROM public.editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
         OR EXISTS (SELECT 1 FROM public.blog_editor_site_access a WHERE a.workspace_member_role_id = r.id AND a.project_id = p.id)
    )
    OR
    (
      (storage.foldername(name))[1] = 'ai-temp' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);
