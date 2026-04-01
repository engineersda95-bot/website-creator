'use server';

import { createClient } from '@/lib/supabase/server';
import { canCreateProject } from '@/lib/permissions';

interface PageInput {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  seo?: any;
  language?: string;
}

interface CreateProjectInput {
  projectId: string;
  name: string;
  subdomain: string;
  settings: any;
  initialPages: PageInput[];
}

export async function createProject(
  input: CreateProjectInput
): Promise<{ success: boolean; project?: any; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autenticato' };

  const check = await canCreateProject(user.id);
  if (!check.allowed) return { success: false, error: check.reason };

  const { data: project, error: projError } = await supabase
    .from('projects')
    .insert({
      id: input.projectId,
      user_id: user.id, // sempre dal JWT, mai dal client
      name: input.name,
      subdomain: input.subdomain,
      settings: input.settings,
    })
    .select()
    .single();

  if (projError || !project) {
    return { success: false, error: projError?.message || 'Errore durante la creazione del sito' };
  }

  if (input.initialPages.length > 0) {
    const { error: pagesError } = await supabase.from('pages').insert(
      input.initialPages.map((p) => ({ ...p, project_id: input.projectId }))
    );
    if (pagesError) console.error('[createProject] Pages error:', pagesError);
  }

  return { success: true, project };
}
