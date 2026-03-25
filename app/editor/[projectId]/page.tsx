import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectDashboardClient } from './ProjectDashboardClient';

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

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  return (
    <ProjectDashboardClient
      initialUser={user}
      initialProject={project}
      initialPages={pages || []}
    />
  );
}
