import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectListClient } from './ProjectListClient';

export default async function EditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <ProjectListClient initialUser={user} initialProjects={projects || []} />;
}
