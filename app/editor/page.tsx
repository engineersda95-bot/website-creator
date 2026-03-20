import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditorClient } from './EditorClient';
import { v4 as uuidv4 } from 'uuid';

export default async function EditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch user's latest project
  let { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  let project = projects?.[0];
  let pages = [];

  // 2. Create project if missing
  if (!project) {
    const newProjId = uuidv4();
    const { data: newProj, error: createError } = await supabase
      .from('projects')
      .insert({
        id: newProjId,
        user_id: user.id,
        name: 'Il Mio Sito',
        subdomain: `site-${newProjId.substring(0, 8)}`,
        settings: { fontFamily: 'Outfit', primaryColor: '#3b82f6', secondaryColor: '#10b981' }
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating initial project server-side:', createError);
      // Still pass user so client can try to recover or show error
    } else {
      project = newProj;
    }
  }

  // 3. Fetch pages for the project
  if (project) {
    const { data: pPages } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: true });
    
    pages = pPages || [];

    // 4. Create home page if missing (empty project)
    if (pages.length === 0) {
       const { data: homePage } = await supabase
         .from('pages')
         .insert({
           id: uuidv4(),
           project_id: project.id,
           title: 'Home',
           slug: 'home',
           blocks: [] // loadPage will fill this with template blocks if needed on client
         })
         .select()
         .single();
       
       if (homePage) pages = [homePage];
    }
  }

  return <EditorClient initialUser={user} initialProject={project} initialPages={pages} />;
}
