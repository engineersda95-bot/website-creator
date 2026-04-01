import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BlogPostEditorClient } from './BlogPostEditorClient';

export default async function BlogPostEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; postId: string }>;
}) {
  const { projectId, postId } = await params;
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

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .eq('project_id', projectId)
    .single();

  if (!post) redirect(`/editor/${projectId}`);

  return (
    <BlogPostEditorClient
      initialUser={user}
      initialProject={project}
      initialPost={post}
    />
  );
}
