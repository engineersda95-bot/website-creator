import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectListClient } from './ProjectListClient';
import { getUserLimits } from '@/lib/permissions';

export default async function EditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: projects }, userLimits] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    getUserLimits(user.id),
  ]);

  return (
    <ProjectListClient
      initialUser={user}
      initialProjects={projects || []}
      userLimits={userLimits}
      projectCount={projects?.length ?? 0}
    />
  );
}
