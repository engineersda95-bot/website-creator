import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditorClient } from './EditorClient';

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch project (must belong to user)
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) redirect('/editor');

  // Fetch all pages and site_globals for this project
  const [{ data: pages }, { data: siteGlobals }] = await Promise.all([
    supabase.from('pages').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
    supabase.from('site_globals').select('*').eq('project_id', projectId),
  ]);

  const allPages = pages || [];
  const targetPage = allPages.find(p => p.id === pageId);

  if (!targetPage) redirect(`/editor/${projectId}`);

  return (
    <EditorClient
      initialUser={user}
      initialProject={project}
      initialPages={allPages}
      initialPageId={pageId}
      initialSiteGlobals={siteGlobals || []}
    />
  );
}
