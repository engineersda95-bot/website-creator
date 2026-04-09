import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectDashboardClient } from './ProjectDashboardClient';
import { getUserLimits } from '@/lib/permissions';

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) redirect('/editor');

  const [{ data: pages }, { data: siteGlobals }, { data: blogPosts }, userLimits] = await Promise.all([
    supabase.from('pages').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
    supabase.from('site_globals').select('*').eq('project_id', projectId),
    supabase.from('blog_posts')
      .select('id, slug, title, excerpt, cover_image, language, status, published_at, authors, categories, translation_group, created_at, updated_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
    getUserLimits(user.id),
  ]);

  return (
    <ProjectDashboardClient
      initialUser={user}
      initialProject={project}
      initialPages={pages || []}
      initialSiteGlobals={siteGlobals || []}
      initialBlogPosts={blogPosts || []}
      userLimits={userLimits}
    />
  );
}
