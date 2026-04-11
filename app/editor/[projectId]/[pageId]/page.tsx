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

  // Fetch target page (full) + other pages stubs (no blocks) + site_globals in parallel
  const [{ data: targetPage }, { data: pageStubs }, { data: siteGlobals }] = await Promise.all([
    supabase.from('pages').select('*').eq('id', pageId).eq('project_id', projectId).single(),
    supabase.from('pages').select('id, slug, title, language, translations_group_id').eq('project_id', projectId).order('created_at', { ascending: true }),
    supabase.from('site_globals').select('*').eq('project_id', projectId),
  ]);

  if (!targetPage) redirect(`/editor/${projectId}`);

  // Merge: stubs array with targetPage (full) replacing its stub entry
  const allPages = (pageStubs || []).map(p => p.id === pageId ? targetPage : p);

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
